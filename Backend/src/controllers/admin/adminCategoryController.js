import Category from '../../models/Category.js';
import Product from '../../models/Product.js';

export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .select('name createdAt updatedAt')
      .populate('subcategories', 'name')
      .sort({ createdAt: -1 });
    return res.json({ categories });
  } catch (err) {
    console.error('listCategories error:', err);
    return res.status(500).json({ error: 'Server error while fetching categories' });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).select('name createdAt updatedAt');
    if (!category) return res.status(404).json({ error: 'Category not found' });
    return res.json({ category });
  } catch (err) {
    console.error('getCategory error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const trimmedName = name.trim();

    // 1. Check for case-insensitive duplicate before saving
    const exists = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') }
    });

    if (exists) {
      return res.status(409).json({ error: 'A category with this name already exists' });
    }

    // 2. Create the category
    const category = await Category.create({ name: trimmedName });

    return res.status(201).json({
      success: true,
      category
    });

  } catch (err) {
    console.error('createCategory error:', err);

    // 3. Catch database-level unique constraint violations
    if (err.code === 11000) {
      return res.status(409).json({ error: 'Duplicate entry: This category already exists in the database.' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ error: 'Category not found' });

    if (name !== undefined) {
      category.name = name.trim();
    }
    await category.save();
    return res.json({ success: true });
  } catch (err) {
    console.error('updateCategory error:', err);
    if (err.code === 11000) return res.status(409).json({ error: 'Name already exists' });
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const count = await Product.countDocuments({ category: categoryId });
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete: products exist in this category.' });
    }
    await Category.findByIdAndDelete(categoryId);
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteCategory error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};