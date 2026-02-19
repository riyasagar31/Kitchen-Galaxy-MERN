import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  price: { type: Number, required: true },
  image: { type: String }, // Store product image
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Added seller ref
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'In Transit'],
    default: 'Pending'
  }
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [OrderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: {
    phone: String,
    address: String,
    city: String,
    pincode: String
  },
  paymentMethod: { type: String, default: 'COD' },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'In Transit'],
    default: 'Pending'
  },
  sellers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }] // List of all sellers in this order
}, { timestamps: true });

export default mongoose.model('Order', OrderSchema);