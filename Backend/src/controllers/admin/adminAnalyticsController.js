import Order from '../../models/Order.js';
import User from '../../models/User.js';
import Product from '../../models/Product.js';

// 1. Monthly Sales Chart
export const getMonthlySales = async (req, res) => {
    try {
        const sales = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    totalSales: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 2. Orders per Month
export const getOrdersPerMonth = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. Total Users / Orders / Products Count + GST Collected
export const getDashboardCounts = async (req, res) => {
    try {
        const users = await User.countDocuments();
        const products = await Product.countDocuments();
        const orders = await Order.countDocuments();
        const totalSalesAgg = await Order.aggregate([
            { $match: { status: { $ne: 'Cancelled' } } },
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);
        const gstAgg = await Order.aggregate([
            { $match: { status: 'Delivered' } },
            { $group: { _id: null, total: { $sum: "$gstAmount" } } }
        ]);

        res.json({
            users,
            products,
            orders,
            totalSales: totalSalesAgg.length > 0 ? totalSalesAgg[0].total : 0,
            gstCollected: gstAgg.length > 0 ? gstAgg[0].total : 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. Top Selling Products
export const getTopProducts = async (req, res) => {
    try {
        const topProducts = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product",
                    name: { $first: "$items.name" },
                    totalSold: { $sum: "$items.qty" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]);

        res.json(topProducts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. Seller-wise Revenue
export const getSellerRevenue = async (req, res) => {
    try {
        const sellerRevenue = await Order.aggregate([
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.seller",
                    revenue: { $sum: { $multiply: ["$items.price", "$items.qty"] } }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "sellerInfo"
                }
            },
            { $unwind: "$sellerInfo" },
            {
                $project: {
                    sellerName: "$sellerInfo.name",
                    revenue: 1
                }
            },
            { $sort: { revenue: -1 } }
        ]);

        res.json(sellerRevenue);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. Payment Method Distribution
export const getPaymentMethodDistribution = async (req, res) => {
    try {
        const distribution = await Order.aggregate([
            {
                $group: {
                    _id: "$paymentMethod",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json(distribution);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. Admin Sales / GST Report (all orders, date-filterable, per-item rows)
export const getAdminReport = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;

        let query = {};
        if (fromDate || toDate) {
            query.createdAt = {};
            if (fromDate) query.createdAt.$gte = new Date(fromDate);
            if (toDate) {
                const end = new Date(toDate);
                end.setHours(23, 59, 59, 999);
                query.createdAt.$lte = end;
            }
        }

        const orders = await Order.find(query)
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        const reportData = [];
        let totalSales = 0;
        let totalOrdersCount = 0;
        let totalGst = 0;
        const countedOrders = new Set();

        orders.forEach(order => {
            const isDelivered = order.status === 'Delivered';

            if (isDelivered && !countedOrders.has(order._id.toString())) {
                totalOrdersCount++;
                countedOrders.add(order._id.toString());
            }

            order.items.forEach(item => {
                const itemBase = item.price * item.qty;
                const itemGst = item.gstAmount || 0;

                if (isDelivered) {
                    totalSales += itemBase;
                    totalGst += itemGst;
                }

                reportData.push({
                    orderId: order._id,
                    orderDate: order.createdAt,
                    customerName: order.user?.name || 'N/A',
                    customerEmail: order.user?.email || '',
                    productName: item.name,
                    qty: item.qty,
                    basePrice: item.price,
                    gstRate: item.gstRate || 0,
                    gstAmount: itemGst,
                    totalAmount: itemBase + itemGst,
                    status: order.status
                });
            });
        });

        res.json({
            summary: {
                totalSales,
                totalOrders: totalOrdersCount,
                gstCollected: totalGst
            },
            report: reportData
        });

    } catch (error) {
        console.error('getAdminReport error:', error);
        res.status(500).json({ message: error.message });
    }
};
