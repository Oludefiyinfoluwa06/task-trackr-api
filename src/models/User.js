const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    organizationName: { type: String },
    organization: { type: Schema.Types.ObjectId, ref: 'Organization' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
    fullName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    resetVerified: { type: Boolean, default: false },
    resetVerifiedExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
