const express = require('express');
const Store = require('../models/Store');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const upload = require('../utils/multer');
const { uploadToCloudinary } = require('../utils/cloudinary');

const router = express.Router();

// POST /api/store — vendor creates store
router.post('/', protect, requireRole('vendor'), async (req, res) => {
  try {
    const existing = await Store.findOne({ vendorId: req.user._id });
    if (existing) {
      return res.status(409).json({ message: 'Store already exists for this vendor.' });
    }

    const { storeName, description, pincode, city } = req.body;
    const store = await Store.create({
      vendorId: req.user._id,
      storeName,
      description,
      pincode,
      city,
    });

    return res.status(201).json({ message: 'Store created. Awaiting admin approval.', store });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/store/my — vendor gets their own store
router.get('/my', protect, requireRole('vendor'), async (req, res) => {
  try {
    const store = await Store.findOne({ vendorId: req.user._id });
    if (!store) return res.status(404).json({ message: 'No store found.' });
    return res.json(store);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/store/:id — public store details + products
router.get('/:id', async (req, res) => {
  try {
    const store = await Store.findById(req.params.id).populate('vendorId', 'name email');
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    const products = await Product.find({ storeId: store._id });
    return res.json({ store, products });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/store/:id — vendor updates store
router.put('/:id', protect, requireRole('vendor'), upload.single('coverImage'), async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found.' });
    if (store.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const { storeName, description, pincode, city } = req.body;
    if (storeName) store.storeName = storeName;
    if (description !== undefined) store.description = description;
    if (pincode) store.pincode = pincode;
    if (city !== undefined) store.city = city;

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'nearmart/stores');
      store.coverImage = result.secure_url;
    }

    await store.save();
    return res.json({ message: 'Store updated.', store });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
