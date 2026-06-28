const STATUS_CONFIG = {
  pending:   { label: 'Pending',   badge: 'badge-warning', dot: 'pending'   },
  confirmed: { label: 'Confirmed', badge: 'badge-info',    dot: 'confirmed' },
  delivered: { label: 'Delivered', badge: 'badge-success', dot: 'delivered' },
  cancelled: { label: 'Cancelled', badge: 'badge-danger',  dot: 'cancelled' },
};

export default function OrderStatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`badge ${config.badge}`}>
      <span className={`status-dot ${config.dot}`} />
      {config.label}
    </span>
  );
}
