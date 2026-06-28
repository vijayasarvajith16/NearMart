const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    storeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Store', required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Baked Goods', 'Dairy & Eggs', 'Fruits & Vegetables', 'Handmade Crafts', 'Pickles & Preserves', 'Organic', 'Other'],
      default: 'Other',
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    pincode: { type: String, default: '' },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
