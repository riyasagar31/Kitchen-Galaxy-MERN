import mongoose from 'mongoose';

const OrderItemSchema = new mongoose.Schema({

  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },

  name: {
    type: String,
    required: true
  },

  qty: {
    type: Number,
    required: true,
    min: 1
  },

  price: {
    type: Number,
    required: true
  },

  gstRate: {
    type: Number,
    default: 18
  },

  gstAmount: {
    type: Number,
    default: 0
  },

  image: {
    type: String
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'In Transit',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  }

});


const OrderSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  items: [OrderItemSchema],

  subtotal: {
    type: Number,
    required: true
  },

  gstAmount: {
    type: Number,
    required: true
  },

  cgst: {
    type: Number,
    required: true
  },

  sgst: {
    type: Number,
    required: true
  },

  discount: {
    type: Number,
    default: 0
  },

  couponCode: {
    type: String
  },

  totalAmount: {
    type: Number,
    required: true
  },

  shippingAddress: {

    phone: {
      type: String
    },

    address: {
      type: String
    },

    city: {
      type: String
    },

    pincode: {
      type: String
    }

  },

  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay', 'Online'],
    default: 'COD'
  },

  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending'
  },

  status: {
    type: String,
    enum: [
      'Pending',
      'Confirmed',
      'Processing',
      'Shipped',
      'In Transit',
      'Delivered',
      'Cancelled'
    ],
    default: 'Pending'
  },

  sellers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ]

},
  {
    timestamps: true
  });


export default mongoose.model('Order', OrderSchema);