import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, LogOut, User, Package, LayoutDashboard, ShieldCheck, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isRole } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 900,
      background: 'rgba(10, 15, 13, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, var(--primary), var(--amber))',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif',
            color: '#fff', flexShrink: 0,
          }}>N</div>
          <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
            Near<span style={{ color: 'var(--primary-light)' }}>Mart</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <NavLink to="/products" active={isActive('/products')}>Products</NavLink>
          {isRole('vendor') && (
            <>
              <NavLink to="/vendor/dashboard" active={isActive('/vendor/dashboard')}>Dashboard</NavLink>
              <NavLink to="/vendor/products" active={isActive('/vendor/products')}>My Products</NavLink>
              <NavLink to="/vendor/orders" active={isActive('/vendor/orders')}>Orders</NavLink>
            </>
          )}
          {isRole('admin') && (
            <NavLink to="/admin" active={isActive('/admin')}>Admin</NavLink>
          )}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Cart */}
          {isRole('buyer') && (
            <Link to="/cart" style={{ position: 'relative', display: 'flex' }}>
              <button className="btn btn-ghost btn-icon">
                <ShoppingCart size={20} />
              </button>
              {cartCount > 0 && (
                <span style={{
                  position: 'absolute', top: -2, right: -2,
                  background: 'var(--primary)', color: '#fff',
                  borderRadius: '50%', width: 18, height: 18,
                  fontSize: '0.7rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '2px solid var(--bg)',
                }}>{cartCount > 9 ? '9+' : cartCount}</span>
              )}
            </Link>
          )}

          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <div className="avatar" style={{ width: 34, height: 34, fontSize: '0.85rem' }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
              </button>

              {dropdownOpen && (
                <>
                  <div onClick={() => setDropdownOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 998 }} />
                  <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    minWidth: 180,
                    boxShadow: 'var(--shadow-lg)',
                    overflow: 'hidden',
                    zIndex: 999,
                    animation: 'fadeIn 0.15s ease',
                  }}>
                    <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>{user.role}</div>
                      <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>{user.name}</div>
                    </div>
                    {isRole('buyer') && (
                      <DropdownItem to="/orders" icon={<Package size={15} />} onClick={() => setDropdownOpen(false)}>My Orders</DropdownItem>
                    )}
                    {isRole('vendor') && (
                      <>
                        <DropdownItem to="/vendor/dashboard" icon={<LayoutDashboard size={15} />} onClick={() => setDropdownOpen(false)}>Dashboard</DropdownItem>
                        <DropdownItem to="/vendor/store" icon={<Store size={15} />} onClick={() => setDropdownOpen(false)}>My Store</DropdownItem>
                      </>
                    )}
                    {isRole('admin') && (
                      <DropdownItem to="/admin" icon={<ShieldCheck size={15} />} onClick={() => setDropdownOpen(false)}>Admin Panel</DropdownItem>
                    )}
                    <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%', padding: '10px 16px',
                        background: 'none', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                        color: 'var(--danger)', fontSize: '0.88rem', fontWeight: 600,
                        transition: 'var(--transition)',
                      }}
                      onMouseOver={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                      onMouseOut={e => e.currentTarget.style.background = 'none'}
                    >
                      <LogOut size={15} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login"><button className="btn btn-ghost btn-sm">Login</button></Link>
              <Link to="/register"><button className="btn btn-primary btn-sm">Sign Up</button></Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="btn btn-ghost btn-icon mobile-only" onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: 'none' }}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--bg-card)',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <MobileLink to="/products" onClick={() => setMenuOpen(false)}>Products</MobileLink>
          {isRole('vendor') && (
            <>
              <MobileLink to="/vendor/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileLink>
              <MobileLink to="/vendor/products" onClick={() => setMenuOpen(false)}>My Products</MobileLink>
              <MobileLink to="/vendor/orders" onClick={() => setMenuOpen(false)}>Orders</MobileLink>
            </>
          )}
          {isRole('buyer') && (
            <MobileLink to="/orders" onClick={() => setMenuOpen(false)}>My Orders</MobileLink>
          )}
          {isRole('admin') && (
            <MobileLink to="/admin" onClick={() => setMenuOpen(false)}>Admin Panel</MobileLink>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-only { display: flex !important; }
        }
      `}</style>
    </nav>
  );
}

function NavLink({ to, active, children }) {
  return (
    <Link to={to} style={{
      padding: '6px 14px',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.88rem',
      fontWeight: 600,
      fontFamily: 'Outfit, sans-serif',
      color: active ? 'var(--primary-light)' : 'var(--text-secondary)',
      background: active ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
      transition: 'var(--transition)',
      textDecoration: 'none',
    }}
      onMouseOver={e => { if (!active) e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseOut={e => { if (!active) e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >{children}</Link>
  );
}

function DropdownItem({ to, icon, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '10px 16px',
      fontSize: '0.88rem', fontWeight: 500,
      color: 'var(--text-secondary)',
      transition: 'var(--transition)',
      textDecoration: 'none',
    }}
      onMouseOver={e => { e.currentTarget.style.background = 'var(--bg-elevated)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseOut={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >{icon}{children}</Link>
  );
}

function MobileLink({ to, onClick, children }) {
  return (
    <Link to={to} onClick={onClick} style={{
      padding: '12px 16px', borderRadius: 'var(--radius-md)',
      fontSize: '0.95rem', fontWeight: 600,
      color: 'var(--text-secondary)',
      textDecoration: 'none',
      transition: 'var(--transition)',
    }}>{children}</Link>
  );
}
