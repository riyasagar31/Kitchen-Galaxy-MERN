import Order from '../../models/Order.js';
import { sendDeliveryUpdateEmail } from '../../services/mailService.js';

/**
 * GET /api/seller/orders
 */
export const listSellerOrders = async (req, res) => {
    try {
        const sellerId = req.user._id;
        // Find orders where the 'sellers' array contains this seller
        const orders = await Order.find({ sellers: sellerId })
            .populate('user', 'name email phone')
            .populate('items.product', 'name price image')
            .sort({ createdAt: -1 });

        // We should ideally filter items to only show those belonging to this seller
        // But for a simple dashboard, returning the whole order is often acceptable, 
        // provided the frontend filters the view.
        // Let's refine the response to highlight seller's items.

        const sellerOrders = orders.map(order => {
            const myItems = order.items.filter(item => item.seller?.toString() === sellerId.toString());
            // Use the status of the first item (all seller's items in one order should sync eventually)
            const myStatus = myItems.length > 0 ? myItems[0].status : order.status;

            return {
                ...order.toObject(),
                items: myItems,
                sellerStatus: myStatus, // Per-seller status
                totalAmount: myItems.reduce((sum, item) => sum + (item.price * item.qty), 0)
            };
        });

        res.json(sellerOrders);
    } catch (err) {
        console.error('listSellerOrders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * PATCH /api/seller/orders/:id/status
 */
export const updateSellerOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const sellerId = req.user._id;
        const orderId = req.params.id;

        const order = await Order.findOne({ _id: orderId, sellers: sellerId });
        if (!order) return res.status(404).json({ error: 'Order not found or access denied' });

        // 1. Update status for this seller's items
        let updatedAny = false;
        order.items.forEach(item => {
            if (item.seller?.toString() === sellerId.toString()) {
                item.status = status;
                updatedAny = true;
            }
        });

        if (!updatedAny) {
            return res.status(400).json({ error: 'No items for this seller found in this order' });
        }

        // 2. Recalculate global order status
        // Case: If all items have the same status, use that. Otherwise, default to "Pending".
        const allStatuses = order.items.map(item => item.status);
        const uniqueStatuses = [...new Set(allStatuses)];

        if (uniqueStatuses.length === 1) {
            // All items agree on status (e.g., all are "Shipped")
            order.status = uniqueStatuses[0];
        } else {
            // Sellers are at different stages (e.g., one "Shipped", one "Pending")
            // As per user request: "display actual status otherwise status = panding"
            order.status = 'Pending';
        }

        await order.save();

        // 3. Send Delivery Email if status becomes Delivered
        if (status === 'Delivered') {
            const populatedOrder = await Order.findById(orderId).populate('user', 'name email');
            const myItems = populatedOrder.items.filter(item => item.seller?.toString() === sellerId.toString());

            if (populatedOrder.user?.email) {
                await sendDeliveryUpdateEmail(
                    populatedOrder.user.email,
                    populatedOrder.user.name,
                    populatedOrder,
                    myItems
                );
            }
        }

        res.json({
            success: true,
            status: status, // Status of this seller's items
            globalStatus: order.status // Status of the entire order
        });
    } catch (err) {
        console.error('updateSellerOrderStatus error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * PATCH /api/seller-orders/orders/:orderId/items/:itemId/status
 */
export const updateOrderItemStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const sellerId = req.user._id;
        const { orderId, itemId } = req.params;

        const order = await Order.findOne({ _id: orderId, sellers: sellerId });
        if (!order) return res.status(404).json({ error: 'Order not found or access denied' });

        // 1. Find the specific item and update it
        const item = order.items.id(itemId);
        if (!item) return res.status(404).json({ error: 'Item not found in this order' });

        if (item.seller?.toString() !== sellerId.toString()) {
            return res.status(403).json({ error: 'Unauthorized to update this item' });
        }

        item.status = status;

        // 2. Recalculate global order status
        const allStatuses = order.items.map(i => i.status);
        const uniqueStatuses = [...new Set(allStatuses)];

        if (uniqueStatuses.length === 1) {
            order.status = uniqueStatuses[0];
        } else {
            // Check if any items are in transit/shipped/processing
            const progressStatuses = ['Confirmed', 'Processing', 'Shipped', 'In Transit'];
            const hasProgress = allStatuses.some(s => progressStatuses.includes(s));
            const hasDelivery = allStatuses.some(s => s === 'Delivered');

            if (hasDelivery) {
                // If some delivered and some not, it's "Processing" or "Partially Shipped"
                // For simplicity, let's stick to the user's logic or a reasonable default
                order.status = 'Processing';
            } else if (hasProgress) {
                order.status = 'Processing';
            } else {
                order.status = 'Pending';
            }
        }

        await order.save();

        // 3. Send Delivery Email if item status becomes Delivered
        if (status === 'Delivered') {
            const populatedOrder = await Order.findById(orderId).populate('user', 'name email');
            const updatedItem = populatedOrder.items.id(itemId);

            if (populatedOrder.user?.email) {
                await sendDeliveryUpdateEmail(
                    populatedOrder.user.email,
                    populatedOrder.user.name,
                    populatedOrder,
                    [updatedItem]
                );
            }
        }

        res.json({
            success: true,
            itemStatus: item.status,
            globalStatus: order.status
        });
    } catch (err) {
        console.error('updateOrderItemStatus error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * GET /api/seller/analytics
 */
export const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const orders = await Order.find({ sellers: sellerId });

        let totalRevenue = 0;
        let totalOrders = 0;
        let gstCollected = 0;
        const statusCounts = {
            Pending: 0,
            Confirmed: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0
        };

        orders.forEach(order => {
            const myItems = order.items.filter(item => item.seller?.toString() === sellerId.toString());
            if (myItems.length > 0) {
                totalOrders++;
                const orderTotal = myItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
                const orderGst = myItems.reduce((sum, item) => sum + (item.gstAmount || 0), 0);

                if (order.status === 'Delivered') {
                    totalRevenue += orderTotal;
                    gstCollected += orderGst;
                }
                statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            }
        });

        res.json({
            totalRevenue,
            totalOrders,
            gstCollected,
            statusCounts,
            totalProducts: await req.model('Product').countDocuments({ seller: sellerId })
        });
    } catch (err) {
        console.error('getSellerAnalytics error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

/**
 * GET /api/seller-orders/report
 */
export const getSellerReport = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const { fromDate, toDate, type } = req.query;

        let query = { sellers: sellerId };

        // Date Filtering
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) query.createdAt.$lte = new Date(toDate);
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const reportData = [];
        let totalSales = 0;
        let totalOrdersCount = 0;
        let totalGst = 0;

        orders.forEach(order => {
            const myItems = order.items.filter(item => item.seller?.toString() === sellerId.toString());
            if (myItems.length > 0) {
                // Determine if we should count this order in totals
                // Requirement: Only include completed or delivered orders
                const isCompleted = order.status === 'Delivered';

                if (isCompleted) {
                    totalOrdersCount++;
                }

                myItems.forEach(item => {
                    const itemTotal = item.price * item.qty;
                    const itemGst = item.gstAmount || 0;

                    if (isCompleted) {
                        totalSales += itemTotal;
                        totalGst += itemGst;
                    }

                    reportData.push({
                        orderId: order._id,
                        orderDate: order.createdAt,
                        customerName: order.user?.name,
                        productName: item.name,
                        qty: item.qty,
                        basePrice: item.price,
                        gstRate: item.gstRate,
                        gstAmount: itemGst,
                        totalAmount: itemTotal + itemGst,
                        status: item.status
                    });
                });
            }
        });

        res.json({
            summary: {
                totalSales,
                totalOrders: totalOrdersCount,
                gstCollected: totalGst
            },
            report: reportData
        });

    } catch (err) {
        console.error('getSellerReport error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
