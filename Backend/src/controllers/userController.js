import User from '../models/User.js';
import Product from '../models/Product.js'; // Ensure you import the Product model!

// --- Keep your existing code ---
export const approveSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.role = 'seller';
    await user.save();

    return res.json({ message: 'Seller approved successfully', user: user.toSafeJSON() });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

// --- ADD THIS NEW CODE BELOW ---
export const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch the main product
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    // 2. Fetch related items by subCategory
    // We filter by subCategory and ensure we don't show the same product again ($ne)
    const relatedProducts = await Product.find({
      subCategory: product.subCategory, 
      _id: { $ne: id } 
    }).limit(4);

    return res.json({
      success: true,
      product,
      relatedProducts
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};