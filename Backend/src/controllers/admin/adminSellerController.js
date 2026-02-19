// src/controllers/adminSellerController.js
import User from "../../models/User.js";

/**
 * GET /api/admin/sellers?q=<name>
 * Returns sellers whose name matches (case-insensitive).
 */
export const searchSellers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 1) {
      return res.json({ sellers: [] });
    }

    const sellers = await User.find({
      role: 'seller',
      name: { $regex: q.trim(), $options: 'i' }
    })
      // ADDED: 'status' must be selected so the frontend 
      // knows if the user is currently 'pending' or 'active'
      .select('name email _id status') 
      .limit(10);

    return res.json({ sellers });
  } catch (err) {
    console.error('searchSellers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};