import express from 'express';
import Contact from '../models/Contact.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const contact = new Contact({ name, email, subject, message });
        await contact.save();

        res.status(201).json({ success: true, message: 'Message submitted successfully' });
    } catch (err) {
        console.error('Contact submission error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

export default router;
