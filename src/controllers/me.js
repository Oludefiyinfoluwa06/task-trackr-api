const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Organization = require('../models/Organization');

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ error: 'User not found' });

    let orgInfo = { id: null, name: user.organizationName || '' };
    if (user.organization) {
      try {
        const org = await Organization.findById(user.organization).lean();
        if (org) orgInfo = { id: org._id, name: org.name };
      } catch (e) {
        // ignore
      }
    }

    const profile = {
      id: user._id,
      fullName: user.fullName || '',
      email: user.email,
      phone: user.phone || '',
      joinDate: user.createdAt ? new Date(user.createdAt).toLocaleString('en-US', { month: 'long', year: 'numeric' }) : '',
      organization: orgInfo,
    };

    return res.json(profile);
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, email, organizationName } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (email && email !== user.email) {
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'Email already in use' });
      user.email = email;
    }
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (organizationName) {
      user.organizationName = organizationName;
      if (user.organization) {
        try {
          await Organization.findByIdAndUpdate(user.organization, { name: organizationName });
        } catch (e) {
          // ignore
        }
      }
    }

    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const body = req.body || {};
    const { currentPassword, newPassword } = body;
    // Debug logging to help track client request issues
    console.log('changePassword body type:', typeof req.body, 'body:', req.body);
    const hasCurrent = typeof currentPassword !== 'undefined' && currentPassword !== null && currentPassword !== '';
    const hasNew = typeof newPassword !== 'undefined' && newPassword !== null && newPassword !== '';
    if (!hasCurrent || !hasNew) {
      return res.status(400).json({ error: 'Missing fields', details: { hasCurrent, hasNew, body } });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const match = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!match) return res.status(403).json({ error: 'Current password is incorrect' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.userId);
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
};
