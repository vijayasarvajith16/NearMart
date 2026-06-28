import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Truck, MapPin } from 'lucide-react';
import CartItem from '../components/CartItem';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Cart() {
  const { cart, cartTotal, clearCart, fetchCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [placing, setPlacing] = useState(false);

  const items = cart.items || [];

  const handlePlaceOrder = async () => {
    if (!address.trim()) { toast.error('Please enter a delivery address'); return; }
    if (!pincode.trim() || pincode.length !== 6) { toast.error('Please enter a valid 6-digit pincode'); return; }
    
    try {
      setPlacing(true);
      const { data } = await api.post('/orders', { deliveryAddress: address, pincode });
      toast.success(data.message);
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!user || user.role !== 'buyer') {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-icon">🛒</div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Please login as a buyer</h2>
        <Link to="/login"><button className="btn btn-primary">Login</button></Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-icon">🛒</div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>Your cart is empty</h2>
        <p style={{ color: 'var(--text-muted)' }}>Browse local products and add something delicious!</p>
        <Link to="/products"><button className="btn btn-primary">Browse Products</button></Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <h1 className="section-title" style={{ marginBottom: 32 }}>Your Cart</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
          {/* Cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {items.map(item => (
              <CartItem key={item.productId?._id || item._id} item={item} />
            ))}
          </div>

          {/* Order summary */}
          <div className="card" style={{ padding: '24px', position: 'sticky', top: 80 }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: 20 }}>Order Summary</h2>

            {/* Items summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
              {items.map(item => (
                <div key={item.productId?._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                    {item.productId?.name} × {item.quantity}
                  </span>
                  <span>₹{((item.productId?.price || 0) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="divider" />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Subtotal</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 600 }}>₹{cartTotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Delivery</span>
              <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>Free</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0 20px' }}>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>Total</span>
              <span style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '1.4rem', color: 'var(--primary-light)' }}>₹{cartTotal.toFixed(2)}</span>
            </div>

            {/* COD badge */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
              borderRadius: 'var(--radius-md)', padding: '10px 14px', marginBottom: 20,
            }}>
              <span style={{ fontSize: '1.2rem' }}>💵</span>
              <div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.88rem', color: 'var(--primary-light)' }}>Cash on Delivery</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pay when you receive</div>
              </div>
            </div>

            {/* Delivery details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <Truck size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: 'middle' }} />
                Delivery Details
              </div>
              <textarea
                className="form-input"
                placeholder="Full delivery address..."
                value={address}
                onChange={e => setAddress(e.target.value)}
                rows={2}
                style={{ resize: 'none' }}
              />
              <div style={{ position: 'relative' }}>
                <MapPin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  className="form-input"
                  placeholder="Delivery Pincode"
                  value={pincode}
                  onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ paddingLeft: 36 }}
                />
              </div>
            </div>

            <button
              className="btn btn-primary btn-lg"
              style={{ width: '100%', justifyContent: 'center' }}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              <ShoppingBag size={18} />
              {placing ? 'Placing Order...' : 'Place Order (COD)'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 360px"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
