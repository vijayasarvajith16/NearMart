import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, MapPin, Package, ChevronLeft, ChevronRight, Store, Star } from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const { addToCart, cartLoading } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/products/${id}`)
      .then(r => setProduct(r.data))
      .catch(() => toast.error('Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading-page"><div className="spinner" /></div>;
  if (!product) return <div className="empty-state"><h2>Product not found</h2><Link to="/products"><button className="btn btn-outline">Browse Products</button></Link></div>;

  const images = product.images?.length > 0
    ? product.images
    : ['https://placehold.co/600x500/111812/22c55e?text=No+Image'];

  const store = product.storeId;
  const vendor = product.vendorId;

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    await addToCart(product._id, qty);
  };

  return (
    <div className="page">
      <div className="container">
        {/* Back */}
        <Link to="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: 24, textDecoration: 'none' }}>
          <ChevronLeft size={16} /> Back to Products
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'start' }}>
          {/* Images */}
          <div>
            <div style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12, background: 'var(--bg-surface)' }}>
              <img
                src={images[imgIdx]}
                alt={product.name}
                style={{ width: '100%', height: 400, objectFit: 'cover' }}
              />
              {images.length > 1 && (
                <>
                  <button onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={() => setImgIdx(i => (i + 1) % images.length)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', cursor: 'pointer' }}>
                    <ChevronRight size={18} />
                  </button>
                </>
              )}
            </div>
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: 8 }}>
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    onClick={() => setImgIdx(i)}
                    style={{
                      width: 72, height: 56, objectFit: 'cover', cursor: 'pointer',
                      borderRadius: 8,
                      border: i === imgIdx ? '2px solid var(--primary)' : '2px solid transparent',
                      opacity: i === imgIdx ? 1 : 0.6,
                      transition: 'var(--transition)',
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span className="badge badge-success" style={{ alignSelf: 'flex-start' }}>{product.category}</span>

            <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {product.name}
            </h1>

            <div style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '2.2rem', color: 'var(--primary-light)' }}>
              ₹{product.price}
            </div>

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
              {product.description || 'Fresh, locally sourced product from a trusted vendor near you.'}
            </p>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.88rem', color: product.stock > 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
              </span>
            </div>

            {/* Store info */}
            {store && (
              <div className="card" style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, var(--primary-dark), var(--bg-elevated))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Store size={18} style={{ color: 'var(--primary-light)' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Outfit', fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{store.storeName}</div>
                  {store.pincode && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      <MapPin size={11} /> Pincode: {store.pincode} {store.city && `· ${store.city}`}
                    </div>
                  )}
                </div>
                <Link to={`/store/${store._id}`}>
                  <button className="btn btn-ghost btn-sm">Visit Store</button>
                </Link>
              </div>
            )}

            {/* COD badge */}
            <div className="badge badge-success" style={{ alignSelf: 'flex-start', fontSize: '0.82rem', padding: '5px 12px' }}>
              💵 Cash on Delivery Available
            </div>

            {/* Quantity + Add to cart */}
            {user?.role === 'buyer' && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div className="qty-stepper">
                  <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><span style={{ fontSize: '1.1rem' }}>-</span></button>
                  <span className="qty-value">{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}><span style={{ fontSize: '1.1rem' }}>+</span></button>
                </div>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || cartLoading}
                  style={{ flex: 1 }}
                >
                  <ShoppingCart size={18} />
                  {cartLoading ? 'Adding...' : 'Add to Cart'}
                </button>
              </div>
            )}

            {!user && (
              <Link to="/login">
                <button className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                  Login to Add to Cart
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .container > div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
