import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import * as MailService from '../services/mailService.js';

export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;
    const userId = req.user._id;

    // 1. Fetch products to get correct prices and SELLER IDs
    const productIds = items.map(item => item.product);
    const dbProducts = await Product.find({ _id: { $in: productIds } });

    const dbProductsMap = {};
    dbProducts.forEach(p => { dbProductsMap[p._id.toString()] = p; });

    const orderItems = [];
    const orderSellers = new Set();
    let calculatedTotal = 0;

    for (const item of items) {
      const dbProduct = dbProductsMap[item.product];
      if (!dbProduct) {
        return res.status(404).json({ success: false, message: `Product not found: ${item.name}` });
      }

      // Check Stock
      if (dbProduct.stock < item.qty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${dbProduct.name}. Only ${dbProduct.stock} units available.`
        });
      }

      // Add seller to the set
      if (dbProduct.seller) {
        orderSellers.add(dbProduct.seller.toString());
      }

      const itemTotal = dbProduct.price * item.qty;
      calculatedTotal += itemTotal;

      orderItems.push({
        product: item.product,
        name: dbProduct.name,
        qty: item.qty,
        price: dbProduct.price,
        image: dbProduct.image || (dbProduct.images && dbProduct.images[0]), // Save image
        seller: dbProduct.seller // Link item to seller
      });
    }

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      totalAmount: calculatedTotal, // Use server-side calculated total for security
      shippingAddress,
      paymentMethod,
      status: 'Pending',
      sellers: Array.from(orderSellers) // Store unique sellers
    });

    const savedOrder = await newOrder.save();

    // 2. Reduce Stock in Database
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      });
    }

    // Send Confirmation Email (Bill)
    await MailService.sendOrderConfirmationEmail(req.user.email, req.user.name, savedOrder);

    // Clear Cart after order
    await Cart.findOneAndDelete({ user: userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: savedOrder
    });
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};