const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    storeName: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, default: '', trim: true },
    isApproved: { type: Boolean, default: false },
    coverImage: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Store', storeSchema);
