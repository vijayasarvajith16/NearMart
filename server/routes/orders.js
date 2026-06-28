const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Store = require('../models/Store');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// POST /api/orders — place order from cart (COD)
router.post('/', protect, requireRole('buyer'), async (req, res) => {
  const { deliveryAddress, pincode } = req.body;

  try {
    const cart = await Cart.findOne({ buyerId: req.user._id }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty.' });
    }

    // Group cart items by vendorId
    const vendorMap = {};
    for (const item of cart.items) {
      const product = item.productId;
      if (!product) continue;
      const vid = product.vendorId.toString();
      if (!vendorMap[vid]) {
        vendorMap[vid] = { items: [], storeId: product.storeId };
      }
      vendorMap[vid].items.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        image: product.images?.[0] || '',
      });
    }

    const createdOrders = [];
    for (const [vendorId, data] of Object.entries(vendorMap)) {
      const totalAmount = data.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

      const order = await Order.create({
        buyerId: req.user._id,
        vendorId,
        storeId: data.storeId,
        items: data.items,
        totalAmount,
        paymentMethod: 'COD',
        status: 'pending',
        deliveryAddress: deliveryAddress || '',
        pincode: pincode || '',
      });

      // Deduct stock
      for (const item of data.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity },
        });
      }

      createdOrders.push(order);
    }

    // Clear cart after order
    await Cart.findOneAndUpdate({ buyerId: req.user._id }, { items: [] });

    return res.status(201).json({
      message: `${createdOrders.length} order(s) placed successfully. Payment: COD.`,
      orders: createdOrders,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/orders/buyer — buyer's order history
router.get('/buyer', protect, requireRole('buyer'), async (req, res) => {
  try {
    const orders = await Order.find({ buyerId: req.user._id })
      .populate('storeId', 'storeName pincode city')
      .populate('vendorId', 'name')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// GET /api/orders/vendor — vendor's incoming orders
router.get('/vendor', protect, requireRole('vendor'), async (req, res) => {
  try {
    const orders = await Order.find({ vendorId: req.user._id })
      .populate('buyerId', 'name email')
      .sort({ createdAt: -1 });

    return res.json(orders);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// PUT /api/orders/:id/status — vendor updates status
router.put('/:id/status', protect, requireRole('vendor'), async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['confirmed', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
  }

  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    if (order.vendorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    // Restore stock if cancelled
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: item.quantity },
        });
      }
    }

    order.status = status;
    await order.save();
    return res.json({ message: 'Order status updated.', order });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
