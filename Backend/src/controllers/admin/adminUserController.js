import User from "../../models/User.js";
import { sendApprovalEmail, sendRejectionEmail } from "../../services/mailService.js";

/**
 * GET /api/admin/users?role=customer|seller|admin|all
 */
export const listUsers = async (req, res) => {
  try {
    const { role } = req.query;

    if (role === 'admin') {
      const me = await User.findById(req.user.id).select('name email role status createdAt updatedAt');
      return res.json({ users: me ? [me] : [] });
    }

    const filter = {};
    if (role === 'seller') filter.role = 'seller';
    if (role === 'customer') filter.role = 'customer';

    // Updated to select 'status' instead of 'isActive'
    const users = await User.find(filter).select('name email role status createdAt updatedAt');
    return res.json({ users });
  } catch (err) {
    console.error('listUsers error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * GET /api/admin/users/:id
 */
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email role status createdAt updatedAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    console.error('getUser error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/users/:id
 * Update basic fields (name, email, role, status)
 */
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ error: "You can't edit an admin account." });
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;

    // New: Handle the status update (active/pending/inactive)
    if (status !== undefined) {
      if (!['active', 'pending', 'inactive'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status value' });
      }
      user.status = status;
    }

    await user.save();
    return res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    console.error('updateUser error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * PATCH /api/admin/users/:id/status
 * Specifically for approving sellers or deactivating users
 */
export const setUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'active', 'pending', or 'inactive'
    const targetId = req.params.id;

    const user = await User.findById(targetId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ error: "Cannot change status of an admin." });
    }

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    // Send Emails based on status change
    if (status === 'active' && oldStatus !== 'active') {
      // Send Approval Email
      await sendApprovalEmail(user);
    } else if (status === 'inactive' && oldStatus !== 'inactive') {
      // Send Rejection/Deactivation Email
      await sendRejectionEmail(user);
    }

    return res.json({
      message: `User ${user.email} status is now ${user.status}.`,
      user: user.toSafeJSON(),
    });
  } catch (err) {
    console.error('setUserStatus error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};

/**
 * DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId === req.user.id) {
      return res.status(400).json({ error: "You can't delete your own account." });
    }

    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ error: 'User not found' });

    if (target.role === 'admin') {
      return res.status(403).json({ error: "Admin accounts cannot be deleted." });
    }

    await User.findByIdAndDelete(targetId);
    return res.json({ success: true });
  } catch (err) {
    console.error('deleteUser error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};