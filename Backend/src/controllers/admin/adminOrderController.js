// src/controllers/adminOrderController.js
import Order from '../../models/Order.js';

export const listOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email') // Fixed from 'customer' to 'user'
      .populate('items.product', 'name price images')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrder = async (req, res) => {
  try {
    const o = await Order.findById(req.params.id)
      .populate('user', 'name email') // Fixed from 'customer' to 'user'
      .populate('items.product', 'name price images');
    if (!o) return res.status(404).json({ error: 'Not found' });
    res.json(o);
  } catch {
    res.status(400).json({ error: 'Invalid id' });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body; // e.g., Pending, Shipped, Delivered, Cancelled
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: { status } },
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Order.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
