import User from '../models/User.js';

/**
 * Get all addresses for the logged-in user
 */
export const getAddresses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort: default addresses first, then by internal order (or you could add a createdAt to each address object)
        const addresses = user.addresses.sort((a, b) => (b.isDefault - a.isDefault));
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Add a new address
 */
export const addAddress = async (req, res) => {
    try {
        const { name, phone, street, city, state, pincode, isDefault } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If setting as default, unset others first
        if (isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        // If it's the first address, make it default regardless
        const finalIsDefault = user.addresses.length === 0 ? true : isDefault;

        user.addresses.push({
            name,
            phone,
            street,
            city,
            state,
            pincode,
            isDefault: finalIsDefault
        });

        await user.save();
        // Return the newly added address (the last one in the array)
        res.status(201).json(user.addresses[user.addresses.length - 1]);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Update an address
 */
export const updateAddress = async (req, res) => {
    try {
        const { name, phone, street, city, state, pincode, isDefault } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        // If setting as default, unset others first
        if (isDefault && !address.isDefault) {
            user.addresses.forEach(addr => addr.isDefault = false);
        }

        address.name = name || address.name;
        address.phone = phone || address.phone;
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.pincode = pincode || address.pincode;
        address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

        await user.save();
        res.json(address);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

/**
 * Delete an address
 */
export const deleteAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        const wasDefault = address.isDefault;
        user.addresses.pull(req.params.id);

        // If the deleted address was default, set another one as default if exists
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();
        res.json({ message: 'Address deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

/**
 * Set address as default
 */
export const setDefaultAddress = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const address = user.addresses.id(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        user.addresses.forEach(addr => addr.isDefault = false);
        address.isDefault = true;

        await user.save();
        res.json(address);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

