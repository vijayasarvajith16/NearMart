import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, TrendingUp, ShoppingBag, DollarSign, Plus, ArrowRight, Clock } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import OrderStatusBadge from '../components/OrderStatusBadge';

export default function VendorDashboard() {
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/store/my').catch(() => ({ data: null })),
      api.get('/orders/vendor').catch(() => ({ data: [] })),
    ]).then(([storeRes, ordersRes]) => {
      setStore(storeRes.data);
      setOrders(ordersRes.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const revenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="page-header">
          <h1 className="section-title">Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {user?.name}!</p>
        </div>

        {/* No store warning */}
        {!store && (
          <div style={{
            background: 'rgba(245, 158, 11, 0.08)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '24px',
            marginBottom: 32,
            display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <span style={{ fontSize: '2rem' }}>🏪</span>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--amber)', marginBottom: 4 }}>No store yet</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Create your store to start selling on NearMart.</p>
            </div>
            <Link to="/vendor/store"><button className="btn btn-amber">Create Store</button></Link>
          </div>
        )}

        {store && !store.isApproved && (
          <div style={{
            background: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px 24px',
            marginBottom: 32,
            display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <Clock size={20} style={{ color: 'var(--info)', flexShrink: 0 }} />
            <div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--info)' }}>Store pending approval</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginLeft: 8 }}>Admin will review your store shortly.</span>
            </div>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 20, marginBottom: 40 }}>
          <div className="stat-card">
            <div className="stat-icon green"><DollarSign size={22} /></div>
            <div>
              <div className="stat-value">₹{revenue.toFixed(0)}</div>
              <div className="stat-label">Total Revenue</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon amber"><ShoppingBag size={22} /></div>
            <div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon blue"><Clock size={22} /></div>
            <div>
              <div className="stat-value">{pendingCount}</div>
              <div className="stat-label">Pending</div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 40 }}>
          {[
            { to: '/vendor/products', icon: <Package size={20} />, label: 'Manage Products', sub: 'Add, edit, delete', color: 'green' },
            { to: '/vendor/orders', icon: <ShoppingBag size={20} />, label: 'View Orders', sub: 'Update order status', color: 'amber' },
            { to: '/vendor/store', icon: <TrendingUp size={20} />, label: 'Store Settings', sub: 'Update store info', color: 'blue' },
          ].map(link => (
            <Link key={link.to} to={link.to}>
              <div className="card card-hover" style={{ padding: '20px' }}>
                <div className={`stat-icon ${link.color}`} style={{ marginBottom: 12 }}>{link.icon}</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{link.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{link.sub}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent orders */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem' }}>Recent Orders</h2>
            <Link to="/vendor/orders">
              <button className="btn btn-ghost btn-sm" style={{ gap: 6 }}>View All <ArrowRight size={14} /></button>
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p style={{ color: 'var(--text-muted)' }}>No orders yet</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.78rem', color: 'var(--text-muted)' }}>#{order._id.slice(-6)}</td>
                      <td>{order.buyerId?.name || '—'}</td>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 600 }}>₹{order.totalAmount}</td>
                      <td><OrderStatusBadge status={order.status} /></td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
