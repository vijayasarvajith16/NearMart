import { useState, useEffect } from 'react';
import api from '../api/axios';
import OrderStatusBadge from '../components/OrderStatusBadge';
import toast from 'react-hot-toast';

const STATUS_ACTIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);
  const [filter, setFilter] = useState('all');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/vendor');
      setOrders(data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success(`Order marked as ${status}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Incoming Orders</h1>
          <p style={{ color: 'var(--text-muted)' }}>{orders.length} total orders</p>
        </div>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {['all', 'pending', 'confirmed', 'delivered', 'cancelled'].map(s => (
            <button
              key={s}
              className={`chip ${filter === s ? 'active' : ''}`}
              onClick={() => setFilter(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span style={{
                marginLeft: 4,
                background: filter === s ? 'var(--primary)' : 'var(--bg-elevated)',
                color: filter === s ? '#fff' : 'var(--text-muted)',
                borderRadius: 'var(--radius-full)',
                padding: '1px 7px',
                fontSize: '0.72rem',
              }}>
                {s === 'all' ? orders.length : orders.filter(o => o.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p style={{ color: 'var(--text-muted)' }}>No {filter !== 'all' ? filter : ''} orders</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(order => (
              <div key={order._id} className="card" style={{ overflow: 'hidden' }}>
                {/* Order header */}
                <div
                  style={{
                    padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16,
                    cursor: 'pointer', transition: 'var(--transition)',
                    background: expanded === order._id ? 'var(--bg-elevated)' : 'transparent',
                  }}
                  onClick={() => setExpanded(e => e === order._id ? null : order._id)}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{order._id.slice(-8)}</span>
                      <OrderStatusBadge status={order.status} />
                      <span className="badge badge-muted">💵 COD</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                      {order.buyerId?.name || 'Buyer'} · {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary-light)' }}>₹{order.totalAmount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items.length} item(s)</div>
                  </div>
                </div>

                {/* Expanded detail */}
                {expanded === order._id && (
                  <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
                    {/* Items */}
                    <div style={{ marginBottom: 16 }}>
                      {order.items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: i < order.items.length - 1 ? '1px solid rgba(34,197,94,0.06)' : 'none' }}>
                          {item.image && <img src={item.image} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} alt="" />}
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.9rem' }}>{item.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>₹{item.price} × {item.quantity}</div>
                          </div>
                          <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{item.price * item.quantity}</div>
                        </div>
                      ))}
                    </div>

                    {/* Delivery info */}
                    {order.deliveryAddress && (
                      <div style={{ fontSize: '0.83rem', color: 'var(--text-muted)', marginBottom: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: '10px 12px' }}>
                        📍 {order.deliveryAddress} — PIN: {order.pincode}
                      </div>
                    )}

                    {/* Actions */}
                    {STATUS_ACTIONS[order.status]?.length > 0 && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {STATUS_ACTIONS[order.status].map(s => (
                          <button
                            key={s}
                            className={`btn btn-sm ${s === 'cancelled' ? 'btn-danger' : 'btn-primary'}`}
                            onClick={() => updateStatus(order._id, s)}
                            disabled={updating === order._id}
                          >
                            Mark as {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
