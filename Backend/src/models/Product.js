// src/models/Product.js

import mongoose from "mongoose";
import "./Brand.js";

const productSchema = new mongoose.Schema(
{
  name: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  // Category reference
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true
  },

  // SubCategory reference
  subCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SubCategory"
  },

  stock: {
    type: Number,
    default: 0,
    min: 0
  },

  images: [
    {
      type: String
    }
  ],

  // Seller reference
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand"
  },

  isActive: {
    type: Boolean,
    default: true
  },

  ratings: {
    type: Number,
    default: 0
  },

  numReviews: {
    type: Number,
    default: 0
  },

  // GST percentage
  gstRate: {
    type: Number,
    default: 18,
    enum: [5, 12, 18, 28] // Only valid GST slabs
  }

},
{
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
}
);


// ✅ Virtual field for GST amount
productSchema.virtual("gstAmount").get(function () {
  return (this.price * this.gstRate) / 100;
});


// ✅ Virtual field for final price including GST
productSchema.virtual("finalPrice").get(function () {
  return this.price + (this.price * this.gstRate) / 100;
});


export default mongoose.model("Product", productSchema);