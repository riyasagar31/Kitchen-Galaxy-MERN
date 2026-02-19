import express from 'express';
import Product from '../models/Product.js';
import { authMiddleware } from '../middleware/auth.js';
import { uploadImages } from '../middleware/upload.js';

const router = express.Router();

// Create product (seller/admin)
router.post(
  '/',
  authMiddleware,
  uploadImages.array('images', 5),
  async (req, res) => {
    try {
      if (!['seller', 'admin'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      const { name, description, price, category, subCategory, stock } = req.body;
      if (!name || !price || !category) {
        return res.status(400).json({ error: 'Please provide name, price, and category.' });
      }

      const priceNum = Number(price);
      const stockNum = Number(stock ?? 0);
      if (Number.isNaN(priceNum) || priceNum < 0) {
        return res.status(400).json({ error: 'Price must be a non-negative number.' });
      }
      if (Number.isNaN(stockNum) || stockNum < 0) {
        return res.status(400).json({ error: 'Stock must be a non-negative number.' });
      }

      const images = (req.files || []).map(f => `/uploads/${f.filename}`);

      const product = new Product({
        name,
        description,
        price: priceNum,
        category,
        subCategory, // Added subCategory here
        stock: stockNum,
        images,
        seller: req.user.id
      });

      await product.save();
      res.json(product);
    } catch (err) {
      console.error('Create product error:', err);
      res.status(500).json({ error: 'Failed to add product' });
    }
  }
);

// List my products (seller)
router.get('/mine', authMiddleware, async (req, res) => {
  try {
    // Fixed: Added query definition which was missing in your snippet
    const query = { seller: req.user.id };
    const products = await Product.find(query).populate('category', 'name');
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Public list
router.get('/', async (req, res) => {
  try {
    const { q, category, brand, minPrice, maxPrice } = req.query;
    const filter = {
      $and: [
        { $or: [{ isActive: true }, { isActive: { $exists: false } }] },
        { $or: [{ visible: true }, { visible: { $exists: false } }] }
      ]
    };
    if (category) filter.category = category;
    if (brand) filter.brand = brand;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (q) filter.name = { $regex: q, $options: 'i' };

    const products = await Product.find(filter)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name')
      .sort({ createdAt: -1 });
    res.json(products);
  } catch {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// --- UPDATED: Get by ID with Related Items ---
router.get('/:id', async (req, res) => {
  try {
    // 1. Fetch the main product
    const product = await Product.findById(req.params.id)
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name')
      .populate('seller', 'name email');

    if (!product) return res.status(404).json({ error: 'Product not found' });

    // 2. Fetch related items based on the SAME subCategory
    // We exclude the current product using $ne (not equal)
    const relatedProducts = await Product.find({
      subCategory: product.subCategory,
      _id: { $ne: product._id }
    }).limit(4);

    // 3. Return both the product and the related items
    res.json({
      product,
      relatedProducts
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch product and related items' });
  }
});

// Update product (owner or admin)
router.put(
  '/:id',
  authMiddleware,
  uploadImages.array('images', 5),
  async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });

      const isOwner = product.seller.toString() === req.user.id;
      const isAdmin = req.user.role === 'admin';
      if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized' });

      const { name, description, price, category, subCategory, stock, replaceImages } = req.body;

      if (price !== undefined) {
        const priceNum = Number(price);
        if (Number.isNaN(priceNum) || priceNum < 0) return res.status(400).json({ error: 'Invalid price.' });
        product.price = priceNum;
      }
      if (stock !== undefined) {
        const stockNum = Number(stock);
        if (Number.isNaN(stockNum) || stockNum < 0) return res.status(400).json({ error: 'Invalid stock.' });
        product.stock = stockNum;
      }
      if (name !== undefined) product.name = name;
      if (description !== undefined) product.description = description;
      if (category !== undefined) product.category = category;
      if (subCategory !== undefined) product.subCategory = subCategory;

      const newImages = (req.files || []).map(f => `/uploads/${f.filename}`);
      if (newImages.length) {
        product.images = String(replaceImages) === 'true' ? newImages : [...product.images, ...newImages];
      }

      await product.save();
      res.json(product);
    } catch (err) {
      console.error('Update product error:', err);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }
);

// Delete product (owner or admin)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const isOwner = product.seller.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Not authorized' });

    await product.deleteOne();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

export default router;