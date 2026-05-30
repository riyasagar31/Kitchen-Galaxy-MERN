// src/controllers/adminProductController.js
import Product from '../../models/Product.js';
import User from '../../models/User.js';
import Category from '../../models/Category.js';
import Brand from '../../models/Brand.js';

/**
 * POST /api/admin/products
 */
export const createProduct = async (req, res) => {
  try {
    const { name, price, stock, categoryId, subCategoryId, brandId, description = '', seller } = req.body;

    if (!name || !price || !categoryId || !seller) {
      return res.status(400).json({ error: 'Name, price, category, and seller are required' });
    }

    let finalBrandId = brandId;
    if (!finalBrandId) {
      let genericBrand = await Brand.findOne({ name: 'Generic' });
      if (!genericBrand) {
        genericBrand = await Brand.create({ name: 'Generic', status: 'active' });
      }
      finalBrandId = genericBrand._id;
    }

    const getGstRate = async (catId) => {
      const cat = await Category.findById(catId);
      if (!cat) return 18;
      return (cat.name === 'Kitchen Appliances' || cat.name === 'Home Appliances') ? 18 : 12;
    };

    const productData = {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      seller,
      category: categoryId,
      brand: finalBrandId,
      description,
      gstRate: await getGstRate(categoryId),
      images: (req.files || []).map(f => `/uploads/${f.filename}`)
    };

    if (subCategoryId) productData.subCategory = subCategoryId;

    const product = await Product.create(productData);
    return res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('createProduct error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
export const listProducts = async (req, res) => {
  try {
    const { seller, category, visible, q } = req.query; // Added q for search
    const filter = {};

    if (category) filter.category = category;
    if (visible === 'true') filter.visible = true;
    if (visible === 'false') filter.visible = false;
    if (q) filter.name = { $regex: q, $options: 'i' }; // Basic name search

    if (seller) {
      const sellerDoc = await User.findOne({ $or: [{ email: seller }, { _id: seller }] }).select('_id');
      if (sellerDoc) filter.seller = sellerDoc._id;
      else filter.seller = null;
    }

    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .populate('category', 'name')
      .populate('subCategory', 'name') // Added subCategory
      .sort({ createdAt: -1 }); // Sort by newest

    return res.json({ products });
  } catch (err) {
    console.error('listProducts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/products/:id
 */
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('seller', 'name email')
      .populate('category', 'name')
      .populate('subCategory', 'name');
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    console.error('getProduct error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const { name, price, stock, category, visible, description, brand, subCategory, replaceImages } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (category !== undefined) product.category = category;
    if (visible !== undefined) product.visible = visible === 'true' || visible === true;
    if (description !== undefined) product.description = description;
    if (brand !== undefined) product.brand = brand;
    if (subCategory !== undefined) product.subCategory = subCategory;

    // Handle Images
    const newImages = (req.files || []).map(f => `/uploads/${f.filename}`);
    if (newImages.length) {
      if (String(replaceImages) === 'true') {
        product.images = newImages;
      } else {
        product.images = [...product.images, ...newImages];
      }
    }

    await product.save();
    return res.json({ success: true, product });
  } catch (err) {
    console.error('updateProduct error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/products/:id/toggle-visible
 */
export const toggleProductVisible = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    product.visible = !product.visible;
    await product.save();
    return res.json({ success: true, visible: product.visible });
  } catch (err) {
    console.error('toggleProductVisible error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const targetId = req.params.id;
    const product = await Product.findById(targetId);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    await Product.findByIdAndDelete(targetId);
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteProduct error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
