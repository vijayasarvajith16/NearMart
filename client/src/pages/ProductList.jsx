import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    pincode: searchParams.get('pincode') || '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const { data } = await api.get(`/products?${params}`);
      setProducts(data.products || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilters = (newFilters) => setFilters(newFilters);

  const resetFilters = () => setFilters({ search: '', category: '', pincode: '', minPrice: '', maxPrice: '', page: 1 });

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 className="section-title">Browse Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {total} products from local vendors
          </p>
        </div>

        {/* Search bar */}
        <div style={{
          display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap',
        }}>
          <div style={{
            flex: 1, minWidth: 200,
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--bg-surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-full)',
            padding: '0 16px',
          }}>
            <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
              style={{
                flex: 1, background: 'transparent', border: 'none',
                outline: 'none', color: 'var(--text-primary)', padding: '12px 0',
              }}
            />
            {filters.search && (
              <button onClick={() => setFilters(f => ({ ...f, search: '', page: 1 }))}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <button
            className="btn btn-outline"
            onClick={() => setShowFilters(!showFilters)}
            style={{ gap: 8 }}
          >
            <SlidersHorizontal size={16} />
            Filters
            {(filters.category || filters.pincode || filters.minPrice || filters.maxPrice) && (
              <span className="badge badge-success" style={{ padding: '2px 7px' }}>Active</span>
            )}
          </button>
        </div>

        <div className="layout-sidebar">
          {/* Sidebar */}
          <div style={{ display: showFilters ? 'block' : undefined }}>
            <FilterSidebar filters={filters} onChange={handleFilters} onReset={resetFilters} />
          </div>

          {/* Products */}
          <div>
            {loading ? (
              <div className="loading-page" style={{ minHeight: 300 }}>
                <div className="spinner" />
                <p style={{ color: 'var(--text-muted)' }}>Loading products...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700 }}>No products found</h3>
                <p style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search terms</p>
                <button className="btn btn-outline" onClick={resetFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map(p => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 }}>
                    {Array.from({ length: pages }, (_, i) => (
                      <button
                        key={i}
                        className={`btn btn-sm ${filters.page === i + 1 ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
