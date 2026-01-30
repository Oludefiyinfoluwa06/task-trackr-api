const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const Organization = require('../models/Organization');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

exports.register = async (req, res, next) => {
  try {
    const { organizationName, fullName, email, password } = req.body;
    if (!email || !password || !fullName) return res.status(400).json({ error: 'Missing required fields' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    // create organization only when an explicit organizationName is provided
    let organization = null;
    let orgNameProvided = false;
    if (organizationName && organizationName.toString().trim().length > 0) {
      orgNameProvided = true;
      const orgName = organizationName.toString().trim();
      organization = await Organization.create({ name: orgName });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const userPayload = {
      fullName,
      email,
      passwordHash,
      role: 'admin',
    };
    if (orgNameProvided && organization) {
      userPayload.organizationName = organization.name;
      userPayload.organization = organization._id;
    }

    const user = await User.create(userPayload);

    const response = { id: user._id, email: user.email, fullName: user.fullName };
    if (orgNameProvided && organization) response.organization = { id: organization._id, name: organization.name };
    return res.status(201).json(response);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    return res.json({ token, user: { id: user._id, email: user.email, fullName: user.fullName } });
  } catch (err) {
    next(err);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'Email doesn\'t exist' });

    const code = crypto.randomInt(100000, 999999).toString();
    user.resetCode = code;
    user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    await user.save();

    // send reset code via email
    try {
      const mailer = require('../lib/mailer');
      const subject = 'Your Task Trackr reset code';
      const text = `Your password reset code is: ${code}. It expires in 15 minutes.`;
      const html = `<p>Your password reset code is: <strong>${code}</strong></p><p>It expires in 15 minutes.</p>`;
      await mailer.sendMail({ to: email, subject, text, html });
    } catch (err) {
      // Don't fail the request if email sending fails — log and continue
      console.error('Failed to send reset email', err);
    }

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ error: 'Missing email or code' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid code' });

    if (!user.resetCode || user.resetCode !== String(code)) return res.status(400).json({ error: 'Invalid code' });
    if (user.resetCodeExpires && user.resetCodeExpires < new Date()) return res.status(400).json({ error: 'Code expired' });

    // mark as verified for a short window so client can reset password
    user.resetVerified = true;
    user.resetVerifiedExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    // clear the code to avoid reuse
    user.resetCode = undefined;
    user.resetCodeExpires = undefined;
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.status(400).json({ error: 'Missing email or newPassword' });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid request' });

    if (!user.resetVerified) return res.status(403).json({ error: 'Reset not verified' });
    if (user.resetVerifiedExpires && user.resetVerifiedExpires < new Date()) return res.status(403).json({ error: 'Reset verification expired' });

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetVerified = false;
    user.resetVerifiedExpires = undefined;
    await user.save();

    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
