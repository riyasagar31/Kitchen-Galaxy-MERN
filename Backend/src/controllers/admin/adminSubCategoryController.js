import SubCategory from '../../models/SubCategory.js';
import Category from '../../models/Category.js';

export const listSubCategories = async (req, res) => {
    try {
        const subCategories = await SubCategory.find()
            .populate('category', 'name')
            .sort({ createdAt: -1 });
        return res.json({ subCategories });
    } catch (err) {
        console.error('listSubCategories error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const createSubCategory = async (req, res) => {
    try {
        const { name, categoryId } = req.body;
        if (!name || !categoryId) return res.status(400).json({ error: 'Name and Category are required' });

        const cat = await Category.findById(categoryId);
        if (!cat) return res.status(400).json({ error: 'Invalid category' });

        const subCategory = await SubCategory.create({
            name: name.trim(),
            category: categoryId
        });
        return res.status(201).json({ subCategory });
    } catch (err) {
        console.error('createSubCategory error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const updateSubCategory = async (req, res) => {
    try {
        const { name, categoryId, visible } = req.body;
        const subCategory = await SubCategory.findById(req.params.id);
        if (!subCategory) return res.status(404).json({ error: 'SubCategory not found' });

        if (name !== undefined) subCategory.name = name.trim();
        if (categoryId !== undefined) subCategory.category = categoryId;
        if (visible !== undefined) subCategory.visible = visible;

        await subCategory.save();
        return res.json({ success: true });
    } catch (err) {
        console.error('updateSubCategory error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};

export const deleteSubCategory = async (req, res) => {
    try {
        await SubCategory.findByIdAndDelete(req.params.id);
        return res.json({ success: true });
    } catch (err) {
        console.error('deleteSubCategory error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
};
