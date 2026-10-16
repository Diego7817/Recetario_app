const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 40 },
    nameLower: { type: String, required: true },
    description: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { timestamps: true }
);

// Un usuario no puede tener dos grupos con el mismo nombre
groupSchema.index({ owner: 1, nameLower: 1 }, { unique: true });

module.exports = mongoose.model('Group', groupSchema);
