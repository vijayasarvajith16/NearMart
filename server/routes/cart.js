const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

const router = express.Router();

// GET /api/cart — buyer's populated cart
router.get('/', protect, requireRole('buyer'), async (req, res) => {
  try {
    let cart = await Cart.findOne({ buyerId: req.user._id }).populate(
      'items.productId',
      'name price images stock storeId vendorId'
    );

    if (!cart) {
      cart = { buyerId: req.user._id, items: [] };
    }

    return res.json(cart);
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/cart/add — add/update item
router.post('/add', protect, requireRole('buyer'), async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  try {
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found.' });
    if (product.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock.' });
    }

    let cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) {
      cart = new Cart({ buyerId: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );

    if (existingItem) {
      existingItem.quantity = quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    await cart.populate('items.productId', 'name price images stock storeId vendorId');
    return res.json({ message: 'Cart updated.', cart });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/cart/:productId — remove item
router.delete('/:productId', protect, requireRole('buyer'), async (req, res) => {
  try {
    const cart = await Cart.findOne({ buyerId: req.user._id });
    if (!cart) return res.status(404).json({ message: 'Cart not found.' });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== req.params.productId
    );

    await cart.save();
    await cart.populate('items.productId', 'name price images stock storeId vendorId');
    return res.json({ message: 'Item removed.', cart });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

// DELETE /api/cart — clear cart
router.delete('/', protect, requireRole('buyer'), async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ buyerId: req.user._id }, { items: [] });
    return res.json({ message: 'Cart cleared.' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error.' });
  }
});

module.exports = router;
