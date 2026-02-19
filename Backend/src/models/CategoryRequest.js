import mongoose from 'mongoose';

const CategoryRequestSchema = new mongoose.Schema({
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['category', 'subcategory', 'brand'], required: true },
    name: { type: String, required: true, trim: true },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // For subcategory requests
    description: { type: String, trim: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    adminComment: { type: String }
}, { timestamps: true });

export default mongoose.model('CategoryRequest', CategoryRequestSchema);
