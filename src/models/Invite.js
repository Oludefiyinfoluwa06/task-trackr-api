const { Schema, model } = require('mongoose');

const inviteSchema = new Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  organization: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  role: { type: String, enum: ['member', 'admin'], default: 'member' },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = model('Invite', inviteSchema);
