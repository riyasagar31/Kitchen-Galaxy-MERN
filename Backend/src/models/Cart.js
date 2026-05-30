// src/models/Cart.js

import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },

  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  gstRate: {
    type: Number,
    required: true
  },

  image: {
    type: String,
    default: ''
  },

  images: {
    type: [String],
    default: []
  },

  quantity: {
    type: Number,
    default: 1,
    min: 1
  }

});


const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    items: [cartItemSchema]

  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);



// ✅ Subtotal (without GST)
cartSchema.virtual("subtotal").get(function () {

  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

});



// ✅ Total GST amount
cartSchema.virtual("totalGST").get(function () {

  return this.items.reduce((total, item) => {

    const gst = (item.price * item.gstRate / 100) * item.quantity;

    return total + gst;

  }, 0);

});



// ✅ Grand Total (Price + GST)
cartSchema.virtual("grandTotal").get(function () {

  const subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const gstTotal = this.items.reduce((total, item) => {
    return total + ((item.price * item.gstRate / 100) * item.quantity);
  }, 0);

  return subtotal + gstTotal;

});


export default mongoose.model("Cart", cartSchema);