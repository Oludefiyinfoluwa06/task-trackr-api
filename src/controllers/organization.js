const crypto = require('crypto');
const Invite = require('../models/Invite');
const User = require('../models/User');
const Organization = require('../models/Organization');

exports.invite = async (req, res, next) => {
  try {
    const inviter = await User.findById(req.userId);
    if (!inviter) return res.status(401).json({ error: 'Unauthorized' });
    if (inviter.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
    const orgId = inviter.organization;
    if (!orgId) return res.status(400).json({ error: 'No organization associated with inviter' });

    const { email, role } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const token = crypto.randomBytes(20).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await Invite.create({ email, organization: orgId, role: role || 'member', token, expiresAt });

    // send email with invite link
    try {
      const mailer = require('../lib/mailer');
      const subject = 'You are invited to join Task Trackr';
      const registerLink = `${process.env.APP_BASE_URL || 'http://localhost:19006'}/auth/register?inviteToken=${token}`;
      const text = `You've been invited to join Task Trackr. Use this link to register: ${registerLink}`;
      const html = `<p>You've been invited to join Task Trackr.</p><p><a href="${registerLink}">Register now</a></p>`;
      await mailer.sendMail({ to: email, subject, text, html });
    } catch (e) {
      console.error('Failed to send invite email', e);
    }

    return res.status(201).json({ ok: true });
  } catch (err) {
    next(err);
  }
};
