import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, cartLoading } = useCart();
  const { user } = useAuth();

  const image = product.images?.[0] || 'https://placehold.co/400x300/111812/22c55e?text=No+Image';
  const store = product.storeId;

  return (
    <div className="card card-hover" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Image */}
      <Link to={`/products/${product._id}`} style={{ display: 'block', overflow: 'hidden', position: 'relative' }}>
        <img
          src={image}
          alt={product.name}
          style={{ width: '100%', height: 200, objectFit: 'cover', transition: 'transform 0.4s ease' }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.06)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
        />
        {/* Category badge */}
        <span className="badge badge-success" style={{
          position: 'absolute', top: 12, left: 12,
          backdropFilter: 'blur(8px)',
        }}>
          {product.category}
        </span>
        {product.stock === 0 && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#ef4444', fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', letterSpacing: 1 }}>
              OUT OF STOCK
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <Link to={`/products/${product._id}`}>
            <h3 style={{
              fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem',
              color: 'var(--text-primary)',
              marginBottom: 4,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{product.name}</h3>
          </Link>
          <p style={{
            fontSize: '0.82rem', color: 'var(--text-muted)',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          }}>{product.description || 'Fresh from a local vendor near you.'}</p>
        </div>

        {/* Store info */}
        {store && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <MapPin size={12} />
            <span>{store.storeName}</span>
            {store.pincode && <span>· {store.pincode}</span>}
          </div>
        )}

        {/* Price + Cart */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
          <div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary-light)' }}>
              ₹{product.price}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>
              {product.stock > 0 ? `${product.stock} left` : ''}
            </span>
          </div>

          {user?.role === 'buyer' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => addToCart(product._id, 1)}
              disabled={product.stock === 0 || cartLoading}
              style={{ gap: 4 }}
            >
              <ShoppingCart size={14} />
              Add
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
