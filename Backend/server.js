import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './src/config/db.js';


// Route Imports
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import sellerProductRoutes from './src/routes/sellerProductRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import subCategoryRoutes from './src/routes/subCategoryRoutes.js';
import cartRoutes from './src/routes/cartRoutes.js';
import wishlistRoutes from './src/routes/wishlistRoutes.js';
import brandRoutes from './src/routes/brandRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';
import categoryRequestRoutes from './src/routes/categoryRequestRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Static folder for images (Fixes the broken logo)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes - Defined BEFORE any error handlers
app.use('/api/auth', authRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/subcategories', subCategoryRoutes);
app.use('/api/category-requests', categoryRequestRoutes); // NEW: Category Requests
app.use('/api/seller', sellerProductRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
import sellerOrderRoutes from './src/routes/sellerOrderRoutes.js'; // Helper for import

app.use('/api/orders', orderRoutes);
app.use('/api/seller-orders', sellerOrderRoutes); // NEW: Seller Orders

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

const port = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      console.log(`🚀 Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error);
  }
};

start();