const express = require('express');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../utils/multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// POST /api/products — vendor adds product
router.post('/', protect, requireRole('vendor'), upload.array('images', 5), async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'Create a store first.' });
    if (!store.isApproved) return res.status(403).json({ message: 'Store not yet approved by admin.' });

    const { name, description, price, category, stock } = req.body;

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) => uploadToCloudinary(file.buffer, 'nearmart/products'));
      const results = await Promise.all(uploads);
      imageUrls = results.map((r) => r.secure_url);
    }

    const product = await Product.create({
      storeId: store._id,
      vendorId: req.user._id,
      name,
      description,
      price: Number(price),
      category,
      stock: Number(stock),
      images: imageUrls,
      pincode: store.pincode,
    });

    return res.status(201).json({ message: 'Product added.', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/products — browse all products with filters
router.get('/', async (req, res) => {
  try {
    const { search, category, pincode, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }
    if (category) query.category = category;
    if (pincode) query.pincode = pincode;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('storeId', 'storeName pincode city isApproved')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    // Only show products from approved stores
    const approvedProducts = products.filter((p) => p.storeId?.isApproved);

    return res.json({
      products: approvedProducts,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/products/:id — single product with vendor/store info
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('storeId', 'storeName pincode city coverImage isApproved')
      .populate('vendorId', 'name email');

    if (!product) return res.status(404).json({ message: 'Product not found.' });
    return res.json(product);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/products/:id — vendor edits product
router.put('/:id', protect, requireRole('vendor'), upload.array('images', 5), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { name, description, price, category, stock } = req.body;
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price) product.price = Number(price);
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);

    if (req.files && req.files.length > 0) {
      const uploads = req.files.map((file) => uploadToCloudinary(file.buffer, 'nearmart/products'));
      const results = await Promise.all(uploads);
      product.images = results.map((r) => r.secure_url);
    }

    await product.save();
    return res.json({ message: 'Product updated.', product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/products/:id — vendor deletes product
router.delete('/:id', protect, requireRole('vendor'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    await product.deleteOne();
    return res.json({ message: 'Product deleted.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
