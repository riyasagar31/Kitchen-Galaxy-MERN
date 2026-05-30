import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
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
    let subtotal = 0;
    let totalGstAmount = 0;

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

      const gstRate = dbProduct.gstRate || 18;
      const itemGstAmount = ((dbProduct.price * gstRate) / 100) * item.qty;
      const itemSubtotal = dbProduct.price * item.qty;

      subtotal += itemSubtotal;
      totalGstAmount += itemGstAmount;

      orderItems.push({
        product: item.product,
        name: dbProduct.name,
        qty: item.qty,
        price: dbProduct.price,
        gstRate: gstRate,
        gstAmount: itemGstAmount,
        image: dbProduct.image || (dbProduct.images && dbProduct.images[0]), // Save image
        seller: dbProduct.seller // Link item to seller
      });
    }

    const cgst = totalGstAmount / 2;
    const sgst = totalGstAmount / 2;
    const grandTotal = subtotal + totalGstAmount;

    const newOrder = new Order({
      user: userId,
      items: orderItems,
      subtotal,
      gstAmount: totalGstAmount,
      cgst,
      sgst,
      totalAmount: grandTotal, // Use server-side calculated total for security
      shippingAddress,
      paymentMethod,
      status: 'Pending',
      sellers: Array.from(orderSellers) // Store unique sellers
    });

    const savedOrder = await newOrder.save();

    // 2. Reduce Stock in Database and 3. Notify Sellers
    const sellersToNotify = Array.from(orderSellers);
    for (const sellerId of sellersToNotify) {
      try {
        const seller = await User.findById(sellerId);
        if (seller) {
          const sellerItems = orderItems.filter(item => item.seller.toString() === sellerId);
          await MailService.sendSellerNewOrderEmail(seller.email, seller.name, savedOrder._id, sellerItems);
        }
      } catch (err) {
        console.error(`Failed to notify seller ${sellerId}:`, err);
      }
    }

    // Reduce stock for all items
    for (const item of orderItems) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.qty }
      });
    }

    // Send Confirmation Email to Customer (Bill)
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