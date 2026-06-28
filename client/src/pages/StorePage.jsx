import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Store as StoreIcon } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

export default function StorePage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/store/${id}`)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!data) return <div className="empty-state"><h2>Store not found</h2></div>;

  const { store, products } = data;

  return (
    <div className="page">
      {/* Store header */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', marginBottom: 40 }}>
        {store.coverImage && (
          <img src={store.coverImage} alt="Cover" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
        )}
        <div className="container" style={{ padding: '28px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20 }}>
            <div style={{
              width: 64, height: 64, borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--primary), var(--amber))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <StoreIcon size={28} style={{ color: '#fff' }} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 6 }}>
                {store.storeName}
              </h1>
              {store.pincode && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 8 }}>
                  <MapPin size={14} /> Pincode: {store.pincode} {store.city && `· ${store.city}`}
                </div>
              )}
              {store.description && <p style={{ color: 'var(--text-secondary)', maxWidth: 500, fontSize: '0.9rem' }}>{store.description}</p>}
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: 24 }}>
          Products <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 400 }}>({products.length})</span>
        </h2>
        {products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <p style={{ color: 'var(--text-muted)' }}>No products yet</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p._id} product={{ ...p, storeId: store }} />)}
          </div>
        )}
      </div>
    </div>
  );
}
