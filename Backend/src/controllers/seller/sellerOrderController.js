import Order from '../../models/Order.js';

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
 * GET /api/seller/analytics
 */
export const getSellerAnalytics = async (req, res) => {
    try {
        const sellerId = req.user._id;
        const orders = await Order.find({ sellers: sellerId });

        let totalRevenue = 0;
        let totalOrders = 0;
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
                if (order.status !== 'Cancelled') {
                    totalRevenue += orderTotal;
                }
                statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
            }
        });

        res.json({
            totalRevenue,
            totalOrders,
            statusCounts,
            totalProducts: await req.model('Product').countDocuments({ seller: sellerId })
        });
    } catch (err) {
        console.error('getSellerAnalytics error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
