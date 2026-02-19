import User from '../../models/User.js';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Order from '../../models/Order.js';

export const getAdminSummary = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    const totalSalesAgg = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } } // Fixed field name
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;

    // Orders by status
    const byStatusAgg = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);
    const byStatus = {};
    byStatusAgg.forEach(row => {
      byStatus[row._id] = row.count;
    });

    // Sales last 7 days
    const last7Agg = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" }, // Fixed field name
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      kpis: { totalUsers, totalProducts, totalOrders, totalSales },
      byStatus,
      last7: last7Agg
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
};
