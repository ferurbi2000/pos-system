'use client';

export default function SaleDetailModal({ isOpen, onClose, sale }) {
    if (!isOpen || !sale) return null;

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <div>
                        <h2>
                            Detalle de Venta
                            {sale.orderNumber && <span style={{ marginLeft: '10px', opacity: 0.7 }}>#{String(sale.orderNumber).padStart(4, '0')}</span>}
                        </h2>
                        <span className="sale-id">ID: {sale.id}</span>
                    </div>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    <div className="info-row">
                        <span className="label">Fecha:</span>
                        <span className="value">{formatDate(sale.date)}</span>
                    </div>
                    <div className="info-row">
                        <span className="label">Estado:</span>
                        <span className={`status-badge status-${sale.status.toLowerCase()}`}>
                            {sale.status === 'VOID' ? 'ANULADA' : 'COMPLETADA'}
                        </span>
                    </div>

                    <div className="items-section">
                        <h3>Productos</h3>
                        <div className="items-list">
                            {sale.items.map((item, index) => (
                                <div key={index} className="item-row">
                                    <div className="item-main">
                                        <span className="item-qty">{item.quantity}x</span>
                                        <span className="item-name">{item.name}</span>
                                    </div>
                                    <span className="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="payment-section">
                        <h3>Resumen de Pago</h3>
                        <div className="summary-rows">
                            <div className="summary-row total">
                                <span>Total Venta</span>
                                <span>${sale.total.toFixed(2)}</span>
                            </div>
                            <div className="divider"></div>
                            <div className="summary-row">
                                <span>Pagado</span>
                                <span>${sale.totalPaid.toFixed(2)}</span>
                            </div>
                            {sale.change > 0 && (
                                <div className="summary-row change">
                                    <span>Cambio</span>
                                    <span>${sale.change.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="methods-list">
                            <h4>Métodos de Pago:</h4>
                            {sale.payments.map((p, i) => (
                                <div key={i} className="method-row">
                                    <span>{p.method === 'cash' ? '💵 Efectivo' : '💳 Tarjeta'}</span>
                                    <span>${p.amount.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                </div>
            </div>

            <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          width: 95%;
          max-width: 600px;
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          max-height: 90vh;
          overflow: hidden;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background: var(--bg-secondary);
        }

        .modal-header h2 { margin: 0; font-size: 1.25rem; }
        .sale-id { font-family: monospace; font-size: 0.85rem; color: var(--text-muted); }

        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

        .modal-body {
            padding: 24px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .label { color: var(--text-secondary); }
        .value { font-weight: 500; }

        .status-badge {
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.75rem;
            font-weight: 700;
        }
        .status-completed { color: var(--accent-success); background: #dcfce7; }
        .status-void { color: var(--accent-danger); background: #fee2e2; }

        h3 {
            font-size: 1rem;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin: 0 0 12px 0;
            padding-bottom: 8px;
            border-bottom: 1px dashed var(--border-color);
        }

        .items-list {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .item-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .item-main { display: flex; gap: 12px; }
        .item-qty { font-weight: 600; color: var(--text-secondary); width: 30px;}
        .item-name { color: var(--text-primary); }
        .item-total { font-family: monospace; }

        .summary-rows {
            display: flex;
            flex-direction: column;
            gap: 8px;
            background: var(--bg-primary);
            padding: 16px;
            border-radius: var(--radius-sm);
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
        }

        .summary-row.total {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .summary-row.change {
            color: var(--accent-success);
        }

        .divider { height: 1px; background: var(--border-color); margin: 4px 0; }

        .methods-list {
            margin-top: 16px;
        }

        .methods-list h4 {
            font-size: 0.9rem;
            margin: 0 0 8px 0;
            color: var(--text-secondary);
        }

        .method-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 0.9rem;
            color: var(--text-secondary);
        }

        .modal-footer {
            padding: 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            background: var(--bg-secondary);
        }

        .btn {
            padding: 10px 24px;
            border-radius: var(--radius-sm);
            border: none;
            cursor: pointer;
            font-weight: 500;
        }
        .btn-secondary { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
      `}</style>
        </div>
    );
}
