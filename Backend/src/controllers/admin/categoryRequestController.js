import CategoryRequest from '../../models/CategoryRequest.js';
import Category from '../../models/Category.js';
import SubCategory from '../../models/SubCategory.js';
import Brand from '../../models/Brand.js';

// Create Request (Seller)
export const createRequest = async (req, res) => {
    try {
        const { type, name, parentCategory, description } = req.body;

        if (!type || !name) {
            return res.status(400).json({ message: "Type and Name are required" });
        }

        const request = await CategoryRequest.create({
            seller: req.user.id,
            type,
            name,
            parentCategory,
            description
        });

        res.status(201).json(request);
    } catch (err) {
        console.error("Create Request Error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// List Requests (Admin)
export const getRequests = async (req, res) => {
    try {
        const { status } = req.query;
        const filter = status ? { status } : {};

        const requests = await CategoryRequest.find(filter)
            .populate('seller', 'name email shopName')
            .populate('parentCategory', 'name')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Update Request Status (Admin)
// If approved, we can optionally AUTO-CREATE the resource, or just mark as approved and let admin create manually.
// For now, let's just mark status. The user said "admin create new category... according to sellers request".
export const updateRequestStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, adminComment } = req.body;

        const request = await CategoryRequest.findById(id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.status = status;
        if (adminComment) request.adminComment = adminComment;

        // Auto-create logic if Approved (Optional, but helpful)
        if (status === 'approved') {
            try {
                if (request.type === 'category') {
                    const exists = await Category.findOne({ name: request.name });
                    if (!exists) await Category.create({ name: request.name, description: request.description });
                } else if (request.type === 'brand') {
                    const exists = await Brand.findOne({ name: request.name });
                    if (!exists) await Brand.create({ name: request.name, description: request.description });
                } else if (request.type === 'subcategory') {
                    const exists = await SubCategory.findOne({ name: request.name, category: request.parentCategory });
                    if (!exists) await SubCategory.create({ name: request.name, category: request.parentCategory });
                }
            } catch (e) {
                console.error("Auto-create failed", e);
            }
        }

        await request.save();
        res.json(request);
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};
