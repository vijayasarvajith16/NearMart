const CATEGORIES = [
  'Baked Goods', 'Dairy & Eggs', 'Fruits & Vegetables',
  'Handmade Crafts', 'Pickles & Preserves', 'Organic', 'Other',
];

export default function FilterSidebar({ filters, onChange, onReset }) {
  const handleCategory = (cat) => {
    onChange({ ...filters, category: filters.category === cat ? '' : cat, page: 1 });
  };

  const handlePincode = (e) => {
    onChange({ ...filters, pincode: e.target.value, page: 1 });
  };

  const handlePrice = (key, val) => {
    onChange({ ...filters, [key]: val, page: 1 });
  };

  return (
    <aside style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      display: 'flex', flexDirection: 'column', gap: 28,
      position: 'sticky', top: 80,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>Filters</h3>
        <button className="btn btn-ghost btn-sm" onClick={onReset} style={{ fontSize: '0.78rem', padding: '4px 10px' }}>
          Reset
        </button>
      </div>

      {/* Category */}
      <div>
        <div className="form-label" style={{ marginBottom: 12 }}>Category</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CATEGORIES.map((cat) => (
            <label key={cat} style={{
              display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
              padding: '8px 10px', borderRadius: 'var(--radius-sm)',
              background: filters.category === cat ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
              border: filters.category === cat ? '1px solid var(--primary)' : '1px solid transparent',
              transition: 'var(--transition)',
            }}>
              <input
                type="radio"
                name="category"
                checked={filters.category === cat}
                onChange={() => handleCategory(cat)}
                style={{ accentColor: 'var(--primary)' }}
              />
              <span style={{
                fontSize: '0.88rem', fontWeight: 500,
                color: filters.category === cat ? 'var(--primary-light)' : 'var(--text-secondary)',
              }}>{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Pincode */}
      <div>
        <div className="form-label" style={{ marginBottom: 8 }}>Pincode</div>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. 560001"
          value={filters.pincode || ''}
          onChange={handlePincode}
          maxLength={6}
        />
      </div>

      {/* Price Range */}
      <div>
        <div className="form-label" style={{ marginBottom: 8 }}>Price Range</div>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            className="form-input"
            placeholder="Min ₹"
            value={filters.minPrice || ''}
            onChange={(e) => handlePrice('minPrice', e.target.value)}
            min={0}
            style={{ width: '50%' }}
          />
          <input
            type="number"
            className="form-input"
            placeholder="Max ₹"
            value={filters.maxPrice || ''}
            onChange={(e) => handlePrice('maxPrice', e.target.value)}
            min={0}
            style={{ width: '50%' }}
          />
        </div>
        {filters.maxPrice && (
          <input
            type="range"
            min={0}
            max={5000}
            value={filters.maxPrice}
            onChange={(e) => handlePrice('maxPrice', e.target.value)}
            style={{ width: '100%', marginTop: 10 }}
          />
        )}
      </div>
    </aside>
  );
}
