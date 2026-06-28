import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['Baked Goods', 'Dairy & Eggs', 'Fruits & Vegetables', 'Handmade Crafts', 'Pickles & Preserves', 'Organic', 'Other'];

const defaultForm = { name: '', description: '', price: '', category: 'Other', stock: '', images: [] };

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [storeApproved, setStoreApproved] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [storeRes, productsRes] = await Promise.all([
        api.get('/store/my').catch(() => ({ data: null })),
        api.get('/products').catch(() => ({ data: { products: [] } })),
      ]);
      setStoreApproved(storeRes.data?.isApproved || false);
      // Filter only vendor's own products via vendorId check
      const all = productsRes.data.products || [];
      // Fetch vendor-specific products using store's data
      if (storeRes.data) {
        const vendorProds = await api.get(`/store/${storeRes.data._id}`);
        setProducts(vendorProds.data.products || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const openAdd = () => { setEditing(null); setForm(defaultForm); setImageFiles([]); setModalOpen(true); };
  const openEdit = (p) => {
    setEditing(p._id);
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, stock: p.stock });
    setImageFiles([]);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('description', form.description);
      fd.append('price', form.price);
      fd.append('category', form.category);
      fd.append('stock', form.stock);
      imageFiles.forEach(f => fd.append('images', f));

      if (editing) {
        await api.put(`/products/${editing}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product updated!');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Product added!');
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success('Product deleted');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container">
        <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="section-title">My Products</h1>
            <p style={{ color: 'var(--text-muted)' }}>{products.length} products in your store</p>
          </div>
          {storeApproved ? (
            <button className="btn btn-primary" onClick={openAdd}><Plus size={16} /> Add Product</button>
          ) : (
            <span className="badge badge-warning">Store not approved yet</span>
          )}
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>No products yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>{storeApproved ? 'Add your first product!' : 'Get your store approved first.'}</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => (
              <div key={p._id} className="card" style={{ overflow: 'hidden' }}>
                <img
                  src={p.images?.[0] || 'https://placehold.co/300x180/111812/22c55e?text=Product'}
                  alt={p.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover' }}
                />
                <div style={{ padding: 16 }}>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 4 }}>{p.name}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: 'var(--primary-light)', fontWeight: 700 }}>₹{p.price}</span>
                    <span className="badge badge-muted">Stock: {p.stock}</span>
                  </div>
                  <span className="badge badge-success" style={{ marginBottom: 12, display: 'inline-block' }}>{p.category}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-outline btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(p)}>
                      <Edit2 size={13} /> Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setModalOpen(false); }}>
          <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem' }}>
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Whole Wheat Bread" />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe your product..." rows={3} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" required min={0} value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Stock *</label>
                  <input className="form-input" type="number" required min={0} value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} placeholder="0" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Images (max 5)</label>
                <label className="dropzone" style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" multiple hidden onChange={e => setImageFiles(Array.from(e.target.files).slice(0, 5))} />
                  <Upload size={24} style={{ marginBottom: 8 }} />
                  <div style={{ fontSize: '0.88rem' }}>
                    {imageFiles.length > 0 ? `${imageFiles.length} file(s) selected` : 'Click to upload images'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>JPEG, PNG, WebP · Max 5MB each</div>
                </label>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ flex: 1, justifyContent: 'center' }}>
                  {submitting ? 'Saving...' : (editing ? 'Update Product' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
