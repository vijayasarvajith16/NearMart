import { useState, useEffect } from 'react';
import { MapPin, Save, Upload } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function VendorStore() {
  const [store, setStore] = useState(null);
  const [form, setForm] = useState({ storeName: '', description: '', pincode: '', city: '' });
  const [coverFile, setCoverFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    api.get('/store/my')
      .then(r => {
        setStore(r.data);
        setForm({ storeName: r.data.storeName, description: r.data.description, pincode: r.data.pincode, city: r.data.city || '' });
      })
      .catch(() => setStore(null))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const { data } = await api.post('/store', form);
      setStore(data.store);
      toast.success('Store created! Awaiting admin approval.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create store');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('storeName', form.storeName);
      fd.append('description', form.description);
      fd.append('pincode', form.pincode);
      fd.append('city', form.city);
      if (coverFile) fd.append('coverImage', coverFile);

      const { data } = await api.put(`/store/${store._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStore(data.store);
      toast.success('Store updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update store');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container-sm">
        <div className="page-header">
          <h1 className="section-title">{store ? 'Store Settings' : 'Create Your Store'}</h1>
          {store && (
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <span className={`badge ${store.isApproved ? 'badge-success' : 'badge-warning'}`}>
                {store.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
              </span>
            </div>
          )}
        </div>

        {store?.coverImage && (
          <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 28, maxHeight: 200 }}>
            <img src={store.coverImage} alt="Store cover" style={{ width: '100%', height: 200, objectFit: 'cover' }} />
          </div>
        )}

        <div className="card" style={{ padding: '32px' }}>
          <form onSubmit={store ? handleUpdate : handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label">Store Name *</label>
              <input className="form-input" required value={form.storeName} onChange={e => setForm(f => ({ ...f, storeName: e.target.value }))} placeholder="My Bakery Shop" />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Tell customers about your store..." rows={4} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Pincode *</label>
                <div style={{ position: 'relative' }}>
                  <MapPin size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input className="form-input" required value={form.pincode} onChange={e => setForm(f => ({ ...f, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))} placeholder="560001" style={{ paddingLeft: 36 }} maxLength={6} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">City</label>
                <input className="form-input" value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Bengaluru" />
              </div>
            </div>

            {store && (
              <div className="form-group">
                <label className="form-label">Cover Image</label>
                <label className="dropzone" style={{ cursor: 'pointer' }}>
                  <input type="file" accept="image/*" hidden onChange={e => setCoverFile(e.target.files[0])} />
                  <Upload size={20} style={{ marginBottom: 6 }} />
                  <div style={{ fontSize: '0.88rem' }}>
                    {coverFile ? coverFile.name : 'Click to upload store cover image'}
                  </div>
                </label>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ justifyContent: 'center' }} disabled={saving || creating}>
              <Save size={18} />
              {saving || creating ? 'Saving...' : (store ? 'Save Changes' : 'Create Store')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
