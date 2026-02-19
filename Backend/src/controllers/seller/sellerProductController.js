import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import Brand from '../../models/Brand.js';

export const listMyProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name') // ✅ Added brand population
      .sort({ createdAt: -1 }); // Show newest first
    return res.json({ products });
  } catch (err) {
    console.error('listMyProducts error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getMyProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id })
      .populate('category', 'name')
      .populate('subCategory', 'name')
      .populate('brand', 'name'); // ✅ Added brand population
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ product });
  } catch (err) {
    console.error('getMyProduct error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const createMyProduct = async (req, res) => {
  try {
    // ✅ Extract brandId from req.body
    const { name, price, stock, categoryId, subCategoryId, brandId, description = '' } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({ error: 'Name, price, and category are required' });
    }

    let finalBrandId = brandId;

    // If no brand selected, use or create "Generic" brand
    if (!finalBrandId) {
      let genericBrand = await Brand.findOne({ name: 'Generic' });
      if (!genericBrand) {
        genericBrand = await Brand.create({ name: 'Generic', status: 'active' });
      }
      finalBrandId = genericBrand._id;
    }

    const productData = {
      name: name.trim(),
      price: Number(price),
      stock: Number(stock) || 0,
      seller: req.user.id,
      category: categoryId,
      brand: finalBrandId, // ✅ Use finalBrandId
      description,
      images: req.file ? [`/uploads/${req.file.filename}`] : []
    };

    if (subCategoryId) productData.subCategory = subCategoryId;

    const product = await Product.create(productData);
    return res.status(201).json({ product });
  } catch (err) {
    console.error('createMyProduct error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};

export const updateMyProduct = async (req, res) => {
  try {
    const { name, price, stock, categoryId, subCategoryId, brandId, description } = req.body;

    const product = await Product.findOne({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // ✅ Update fields if provided
    if (name !== undefined) product.name = name.trim();
    if (price !== undefined) product.price = Number(price);
    if (stock !== undefined) product.stock = Number(stock);
    if (description !== undefined) product.description = description;
    if (brandId !== undefined) product.brand = brandId; // ✅ Update brand
    if (categoryId !== undefined) product.category = categoryId;
    if (subCategoryId !== undefined) product.subCategory = subCategoryId || null;

    if (req.file) {
      product.images = [`/uploads/${req.file.filename}`];
    }

    await product.save();
    return res.json({ success: true, product });
  } catch (err) {
    console.error('updateMyProduct error:', err);
    return res.status(500).json({ error: err.message });
  }
};

export const deleteMyProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, seller: req.user.id });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteMyProduct error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};