import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight, ShoppingBag, Store, TrendingUp, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { label: 'Baked Goods', emoji: '🥐' },
  { label: 'Dairy & Eggs', emoji: '🥛' },
  { label: 'Fruits & Vegetables', emoji: '🥦' },
  { label: 'Handmade Crafts', emoji: '🎨' },
  { label: 'Pickles & Preserves', emoji: '🫙' },
  { label: 'Organic', emoji: '🌿' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/products?limit=6')
      .then(r => setFeatured(r.data.products || []))
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient" style={{ padding: '80px 0 60px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.25)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 16px',
            fontSize: '0.82rem', fontWeight: 600,
            color: 'var(--primary-light)',
            marginBottom: 24,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block', boxShadow: '0 0 6px var(--primary)' }} />
            Local vendors, fresh products, your neighbourhood
          </div>

          <h1 style={{
            fontFamily: 'Outfit', fontWeight: 900,
            fontSize: 'clamp(2.2rem, 6vw, 4rem)',
            lineHeight: 1.1, marginBottom: 20,
            color: 'var(--text-primary)',
          }}>
            Discover Fresh &{' '}
            <span style={{
              background: 'linear-gradient(135deg, var(--primary-light), var(--amber))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Local Products</span>
            <br />Near You
          </h1>

          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 40px' }}>
            Shop directly from home bakers, craft sellers, and local farmers in your pincode area.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} style={{
            display: 'flex', gap: 0, maxWidth: 520, margin: '0 auto 48px',
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
            transition: 'var(--transition)',
          }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', paddingLeft: 20, color: 'var(--text-muted)' }}>
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search products, vendors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                flex: 1, padding: '14px 16px',
                background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            />
            <button type="submit" className="btn btn-primary" style={{ borderRadius: 'var(--radius-full)', margin: 4 }}>
              Search
            </button>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
            {[
              { icon: '🏪', label: 'Local Vendors', value: '50+' },
              { icon: '📦', label: 'Products', value: '200+' },
              { icon: '📍', label: 'Pincodes', value: '30+' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.4rem', color: 'var(--primary-light)' }}>{s.value}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-sub" style={{ margin: '8px auto 0' }}>Find exactly what you're looking for</p>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 16,
          }}>
            {CATEGORIES.map(cat => (
              <Link key={cat.label} to={`/products?category=${encodeURIComponent(cat.label)}`}>
                <div className="card card-hover" style={{
                  padding: '24px 16px', textAlign: 'center',
                  cursor: 'pointer',
                }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>{cat.emoji}</div>
                  <div style={{
                    fontFamily: 'Outfit', fontWeight: 600, fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                  }}>{cat.label}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section style={{ padding: '0 0 80px' }}>
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
              <div>
                <h2 className="section-title">Fresh Arrivals</h2>
                <p className="section-sub">Newest products from local vendors</p>
              </div>
              <Link to="/products">
                <button className="btn btn-outline" style={{ gap: 8 }}>
                  View All <ArrowRight size={16} />
                </button>
              </Link>
            </div>
            <div className="product-grid">
              {featured.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section style={{ padding: '60px 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: 8 }}>How NearMart Works</h2>
          <p className="section-sub" style={{ margin: '0 auto 48px' }}>Simple steps to support local vendors</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32 }}>
            {[
              { icon: <MapPin size={28} />, title: 'Search by Pincode', desc: 'Find vendors and products near your area using your pincode.' },
              { icon: <ShoppingBag size={28} />, title: 'Add to Cart', desc: 'Browse and add products from local vendors directly to your cart.' },
              { icon: <Store size={28} />, title: 'Place COD Order', desc: 'Confirm your order with Cash on Delivery — no prepayment needed.' },
              { icon: <TrendingUp size={28} />, title: 'Track Status', desc: 'Track your order from Pending to Delivered in real time.' },
            ].map(step => (
              <div key={step.title} style={{ padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: 'var(--radius-lg)',
                  background: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary-light)',
                }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: 'var(--text-primary)', marginBottom: 12 }}>
            Are You a Local Vendor?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28, maxWidth: 450, margin: '0 auto 28px' }}>
            Create your free store on NearMart and start reaching customers in your area today.
          </p>
          <Link to="/register">
            <button className="btn btn-primary btn-lg">
              <Store size={18} /> Start Selling Free
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
}
