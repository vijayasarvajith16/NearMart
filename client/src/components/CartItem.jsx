import { Trash2, Minus, Plus } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function CartItem({ item }) {
  const { fetchCart, removeFromCart } = useCart();
  const [updating, setUpdating] = useState(false);

  const product = item.productId;
  if (!product) return null;

  const image = product.images?.[0] || 'https://placehold.co/80x80/111812/22c55e?text=Item';

  const updateQty = async (newQty) => {
    if (newQty < 1) { removeFromCart(product._id); return; }
    if (newQty > product.stock) { toast.error('Not enough stock'); return; }
    try {
      setUpdating(true);
      await api.post('/cart/add', { productId: product._id, quantity: newQty });
      await fetchCart();
    } catch {
      toast.error('Failed to update quantity');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{
      display: 'flex', gap: 16, padding: '16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-md)',
      alignItems: 'center',
      transition: 'var(--transition)',
    }}>
      {/* Image */}
      <img
        src={image}
        alt={product.name}
        style={{ width: 72, height: 72, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
      />

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h4 style={{
          fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem',
          color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>{product.name}</h4>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
          ₹{product.price} per unit
        </div>
      </div>

      {/* Quantity Stepper */}
      <div className="qty-stepper">
        <button className="qty-btn" onClick={() => updateQty(item.quantity - 1)} disabled={updating}>
          <Minus size={14} />
        </button>
        <span className="qty-value">{item.quantity}</span>
        <button className="qty-btn" onClick={() => updateQty(item.quantity + 1)} disabled={updating}>
          <Plus size={14} />
        </button>
      </div>

      {/* Subtotal */}
      <div style={{ textAlign: 'right', minWidth: 72 }}>
        <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', color: 'var(--primary-light)' }}>
          ₹{(product.price * item.quantity).toFixed(2)}
        </div>
      </div>

      {/* Remove */}
      <button
        className="btn btn-ghost btn-icon"
        onClick={() => removeFromCart(product._id)}
        style={{ color: 'var(--danger)', flexShrink: 0 }}
        title="Remove item"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
