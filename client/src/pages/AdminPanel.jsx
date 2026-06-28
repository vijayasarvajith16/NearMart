import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Users, Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tab, setTab] = useState('vendors');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, vendorsRes, ordersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/vendors'),
        api.get('/admin/orders'),
      ]);
      setStats(statsRes.data);
      setVendors(vendorsRes.data);
      setOrders(ordersRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const approve = async (storeId) => {
    setProcessing(storeId);
    try {
      await api.put(`/admin/vendors/${storeId}/approve`);
      toast.success('Store approved!');
      fetchAll();
    } catch { toast.error('Failed'); } finally { setProcessing(null); }
  };

  const revoke = async (storeId) => {
    setProcessing(storeId);
    try {
      await api.put(`/admin/vendors/${storeId}/revoke`);
      toast.success('Approval revoked');
      fetchAll();
    } catch { toast.error('Failed'); } finally { setProcessing(null); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <h1 className="section-title">Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform management overview</p>
        </div>

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
            <div className="stat-card">
              <div className="stat-icon green"><DollarSign size={20} /></div>
              <div><div className="stat-value">₹{stats.totalRevenue?.toFixed(0)}</div><div className="stat-label">Revenue</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon amber"><Users size={20} /></div>
              <div><div className="stat-value">{stats.totalUsers}</div><div className="stat-label">Users</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon blue"><ShoppingBag size={20} /></div>
              <div><div className="stat-value">{stats.totalOrders}</div><div className="stat-label">Orders</div></div>
            </div>
            <div className="stat-card">
              <div className="stat-icon red"><TrendingUp size={20} /></div>
              <div><div className="stat-value">{stats.pendingStores}</div><div className="stat-label">Pending Stores</div></div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {[
            { id: 'vendors', label: 'Vendors & Stores' },
            { id: 'orders', label: 'All Orders' },
          ].map(t => (
            <button
              key={t.id}
              className={`chip ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* Vendors tab */}
        {tab === 'vendors' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Vendor</th>
                    <th>Email</th>
                    <th>Store</th>
                    <th>Pincode</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No vendors yet</td></tr>
                  )}
                  {vendors.map(({ vendor, store }) => (
                    <tr key={vendor._id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{vendor.name}</td>
                      <td>{vendor.email}</td>
                      <td>{store?.storeName || <span style={{ color: 'var(--text-muted)' }}>No store</span>}</td>
                      <td>{store?.pincode || '—'}</td>
                      <td>
                        {!store ? (
                          <span className="badge badge-muted">No Store</span>
                        ) : store.isApproved ? (
                          <span className="badge badge-success">Approved</span>
                        ) : (
                          <span className="badge badge-warning">Pending</span>
                        )}
                      </td>
                      <td>
                        {store && !store.isApproved && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => approve(store._id)}
                            disabled={processing === store._id}
                            style={{ gap: 4 }}
                          >
                            <CheckCircle size={13} /> Approve
                          </button>
                        )}
                        {store?.isApproved && (
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => revoke(store._id)}
                            disabled={processing === store._id}
                            style={{ gap: 4 }}
                          >
                            <XCircle size={13} /> Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Buyer</th>
                    <th>Vendor</th>
                    <th>Store</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length === 0 && (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>No orders yet</td></tr>
                  )}
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>#{order._id.slice(-6)}</td>
                      <td>{order.buyerId?.name || '—'}</td>
                      <td>{order.vendorId?.name || '—'}</td>
                      <td>{order.storeId?.storeName || '—'}</td>
                      <td style={{ color: 'var(--primary-light)', fontWeight: 700 }}>₹{order.totalAmount}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'delivered' ? 'badge-success' :
                          order.status === 'confirmed' ? 'badge-info' :
                          order.status === 'cancelled' ? 'badge-danger' : 'badge-warning'
                        }`}>{order.status}</span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
