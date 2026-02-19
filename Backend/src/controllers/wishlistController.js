import Wishlist from '../models/Wishlist.js';

export const toggleWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id; // From requireAuth middleware

    let wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [productId] });
    } else {
      const index = wishlist.products.indexOf(productId);
      if (index === -1) {
        wishlist.products.push(productId); // Add if not there
      } else {
        wishlist.products.splice(index, 1); // Remove if already there (toggle)
      }
      await wishlist.save();
    }

    res.status(200).json({ message: "Wishlist updated", wishlist });
  } catch (error) {
    res.status(500).json({ message: "Error updating wishlist", error });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ user: req.user.id }).populate('products');
    res.status(200).json(wishlist || { products: [] });
  } catch (error) {
    res.status(500).json({ message: "Error fetching wishlist", error });
  }
};