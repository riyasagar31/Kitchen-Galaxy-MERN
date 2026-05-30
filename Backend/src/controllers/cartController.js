import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.product');
    res.json(cart || { items: [] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToCart = async (req, res) => {
  try {

    const { productId, quantity = 1 } = req.body;

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: "Only customers can perform this action" });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    const idx = cart.items.findIndex(i => i.product.toString() === productId);

    const currentQtyInCart = idx > -1 ? cart.items[idx].quantity : 0;
    const newTotalQty = currentQtyInCart + quantity;

    if (newTotalQty > product.stock) {
      return res.status(400).json({
        message: `Cannot add more ${product.name}. Only ${product.stock} units in stock, and you already have ${currentQtyInCart} in your cart.`
      });
    }

    if (idx > -1) {

      cart.items[idx].quantity += quantity;

    } else {

      cart.items.push({
        product: productId,
        name: product.name,
        price: product.price,
        gstRate: product.gstRate, // ✅ GST added
        image: product.image || (product.images && product.images[0]) || '',
        images: product.images || (product.image ? [product.image] : []),
        quantity
      });

    }

    await cart.save();

    res.json(cart);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const updateQuantity = async (req, res) => {
  try {

    const { productId, quantity } = req.body;

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: "Only customers can perform this action" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    const idx = cart.items.findIndex(i => i.product.toString() === productId);

    if (idx > -1) {

      const product = await Product.findById(productId);

      if (quantity > product.stock) {
        return res.status(400).json({ message: `Only ${product.stock} units available for ${product.name}` });
      }

      cart.items[idx].quantity = quantity;

      await cart.save();
    }

    res.json(cart);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const removeItem = async (req, res) => {
  try {

    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: "Only customers can perform this action" });
    }

    const cart = await Cart.findOne({ user: req.user.id });

    cart.items = cart.items.filter(i => i.product.toString() !== req.params.productId);

    await cart.save();

    res.json(cart);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const clearCart = async (req, res) => {
  try {

    const cart = await Cart.findOne({ user: req.user.id });

    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.json({ items: [] });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};