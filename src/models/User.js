const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    organizationName: { type: String },
    fullName: { type: String },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    resetCode: { type: String },
    resetCodeExpires: { type: Date },
    resetVerified: { type: Boolean, default: false },
    resetVerifiedExpires: { type: Date },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
