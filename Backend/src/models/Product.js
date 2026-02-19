// src/models/Product.js
import mongoose from 'mongoose';
import './Brand.js';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    // ✅ category is now an ObjectId reference to Category
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }, // Optional
    stock: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
    // ✅ seller remains linked to User
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', required: false },
    ratings: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);
