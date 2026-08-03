import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, MapPin, MessageCircle } from 'lucide-react';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/orders/buyer')
      .then(r => setOrders(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  if (orders.length === 0) {
    return (
      <div className="empty-state" style={{ marginTop: 80 }}>
        <div className="empty-icon"><Package size={28} /></div>
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>No orders yet</h2>
        <p style={{ color: 'var(--text-muted)' }}>Start shopping from local vendors near you!</p>
        <Link to="/products"><button className="btn btn-primary">Browse Products</button></Link>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">My Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>{orders.length} orders placed</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map(order => (
            <div key={order._id} className="card" style={{ overflow: 'hidden' }}>
              {/* Order row */}
              <div
                style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }}
                onClick={() => setExpanded(e => e === order._id ? null : order._id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{order._id.slice(-8)}</span>
                    <OrderStatusBadge status={order.status} />
                    <span className="badge badge-muted">💵 COD</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {order.storeId?.storeName || 'Local Store'}
                    {order.storeId?.pincode && (
                      <span style={{ marginLeft: 8, color: 'var(--text-muted)' }}>
                        <MapPin size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 2 }} />
                        {order.storeId.pincode}
                      </span>
                    )}
                    <span style={{ marginLeft: 8 }}>· {new Date(order.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-light)' }}>₹{order.totalAmount}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items.length} item(s)</div>
                </div>
              </div>

              {/* Expanded */}
              {expanded === order._id && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)' }}>
                  <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {order.items.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {item.image && <img src={item.image} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} alt="" />}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹{item.price} × {item.quantity}</div>
                        </div>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>₹{item.price * item.quantity}</div>
                      </div>
                    ))}

                    {/* Status timeline */}
                    <div style={{ marginTop: 12, padding: '12px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Status</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {['pending', 'confirmed', 'delivered'].map((s, idx) => {
                          const statuses = ['pending', 'confirmed', 'delivered'];
                          const currentIdx = statuses.indexOf(order.status);
                          const reached = currentIdx >= idx || order.status === 'delivered';
                          return (
                            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span className={`badge ${reached && order.status !== 'cancelled' ? 'badge-success' : 'badge-muted'}`} style={{ fontSize: '0.75rem' }}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </span>
                              {idx < 2 && <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>→</span>}
                            </div>
                          );
                        })}
                        {order.status === 'cancelled' && <span className="badge badge-danger">Cancelled</span>}
                      </div>
                    </div>

                    {order.deliveryAddress && (
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                        📍 Delivery: {order.deliveryAddress} — PIN: {order.pincode}
                      </div>
                    )}

                    {order.vendorId?.phone && (
                      <div style={{
                        marginTop: 12,
                        padding: '14px 16px',
                        background: 'rgba(34, 197, 94, 0.06)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid rgba(34, 197, 94, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 16,
                        flexWrap: 'wrap'
                      }}>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>Need help with this order?</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Contact vendor at: <strong style={{ color: 'var(--text-secondary)' }}>{order.vendorId.phone}</strong></div>
                        </div>
                        <a
                          href={`https://wa.me/91${order.vendorId.phone}?text=${encodeURIComponent(`Hi, I placed Order #${order._id.slice(-8)}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{
                            background: '#25D366',
                            border: 'none',
                            color: '#fff',
                            gap: 8,
                            padding: '10px 18px',
                            fontSize: '0.85rem',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'var(--transition)',
                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.25)',
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(0.9)'}
                          onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                        >
                          <MessageCircle size={16} />
                          Chat on WhatsApp
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
