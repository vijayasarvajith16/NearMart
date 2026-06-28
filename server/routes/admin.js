const express = require('express');
const User = require('../models/User');
const Store = require('../models/Store');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// All admin routes require auth + admin role
router.use(protect, requireRole('admin'));

// GET /api/admin/vendors — all vendors + store approval status
router.get('/vendors', async (req, res) => {
  try {
    const vendors = await User.find({ role: 'vendor' }).select('-passwordHash');
    const vendorIds = vendors.map((v) => v._id);
    const stores = await Store.find({ vendorId: { $in: vendorIds } });

    const storeMap = {};
    stores.forEach((s) => (storeMap[s.vendorId.toString()] = s));

    const result = vendors.map((v) => ({
      vendor: v,
      store: storeMap[v._id.toString()] || null,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/vendors/:storeId/approve — approve a vendor store
router.put('/vendors/:storeId/approve', async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    store.isApproved = true;
    await store.save();

    return res.json({ message: 'Store approved.', store });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/admin/vendors/:storeId/revoke — revoke vendor approval
router.put('/vendors/:storeId/revoke', async (req, res) => {
  try {
    const store = await Store.findById(req.params.storeId);
    if (!store) return res.status(404).json({ message: 'Store not found.' });

    store.isApproved = false;
    await store.save();

    return res.json({ message: 'Store approval revoked.', store });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/stats — platform overview
router.get('/stats', async (req, res) => {
  try {
    const [totalUsers, totalVendors, totalBuyers, totalProducts, totalOrders, pendingStores] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: 'vendor' }),
        User.countDocuments({ role: 'buyer' }),
        Product.countDocuments(),
        Order.countDocuments(),
        Store.countDocuments({ isApproved: false }),
      ]);

    const revenue = await Order.aggregate([
      { $match: { status: { $ne: 'cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    return res.json({
      totalUsers,
      totalVendors,
      totalBuyers,
      totalProducts,
      totalOrders,
      pendingStores,
      totalRevenue: revenue[0]?.total || 0,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/admin/orders — all orders
router.get('/orders', async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyerId', 'name email')
      .populate('vendorId', 'name email')
      .populate('storeId', 'storeName')
      .sort({ createdAt: -1 })
      .limit(100);
    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
