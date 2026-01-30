const { Schema, model } = require('mongoose');

const organizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = model('Organization', organizationSchema);
