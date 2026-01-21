'use client';
import { useState, useMemo } from 'react';
import { useSales } from '@/frontend/hooks/useSales';
import SaleDetailModal from '@/frontend/components/SaleDetailModal';

export default function SalesPage() {
    const { sales, loading, voidSale } = useSales();
    const [period, setPeriod] = useState('today'); // today, week, month, custom
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    const [selectedSale, setSelectedSale] = useState(null);

    const filteredSales = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        return sales.filter(sale => {
            const saleDate = new Date(sale.date);

            if (period === 'today') {
                return saleDate >= startOfDay;
            }
            if (period === 'week') {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - 7);
                return saleDate >= startOfWeek;
            }
            if (period === 'month') {
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return saleDate >= startOfMonth;
            }
            if (period === 'custom') {
                if (!customStart) return true;
                const start = new Date(customStart);
                const end = customEnd ? new Date(customEnd) : new Date();
                // Set end to end of day if same day
                if (customEnd) end.setHours(23, 59, 59);
                return saleDate >= start && saleDate <= end;
            }
            return true;
        });
    }, [sales, period, customStart, customEnd]);

    const handleVoid = async (id) => {
        if (confirm('¿Está seguro de anular esta venta?')) {
            await voidSale(id);
        }
    };

    const formatDate = (isoString) => {
        return new Date(isoString).toLocaleString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const totalSales = filteredSales
        .filter(s => s.status !== 'VOID')
        .reduce((sum, s) => sum + s.total, 0);

    return (
        <div className="page-container">
            <header className="page-header glass-panel">
                <h1>Historial de Ventas</h1>
                <div className="filters">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        className="period-select"
                    >
                        <option value="today">Hoy</option>
                        <option value="week">Últimos 7 días</option>
                        <option value="month">Este Mes</option>
                        <option value="custom">Personalizado</option>
                    </select>

                    {period === 'custom' && (
                        <div className="date-inputs">
                            <input
                                type="date"
                                value={customStart}
                                onChange={(e) => setCustomStart(e.target.value)}
                            />
                            <span>a</span>
                            <input
                                type="date"
                                value={customEnd}
                                onChange={(e) => setCustomEnd(e.target.value)}
                            />
                        </div>
                    )}
                </div>
            </header>

            <div className="stats-cards">
                <div className="stat-card glass-panel">
                    <h3>Ventas Totales</h3>
                    <p className="stat-value">${totalSales.toFixed(2)}</p>
                    <p className="stat-label">En el periodo seleccionado</p>
                </div>
                <div className="stat-card glass-panel">
                    <h3>Transacciones</h3>
                    <p className="stat-value">{filteredSales.length}</p>
                    <p className="stat-label">Total operaciones</p>
                </div>
            </div>

            <div className="table-container glass-panel">
                {loading ? (
                    <p className="loading">Cargando ventas...</p>
                ) : (
                    <table className="sales-table">
                        <thead>
                            <tr>
                                <th>Fecha/Hora</th>
                                <th>ID Venta</th>
                                <th>Total</th>
                                <th>Método</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSales.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="empty-state">No hay ventas registradas</td>
                                </tr>
                            ) : (
                                filteredSales.map(sale => (
                                    <tr key={sale.id} className={sale.status === 'VOID' ? 'voided-row' : ''}>
                                        <td>{formatDate(sale.date)}</td>
                                        <td className="monospace">
                                            {sale.orderNumber
                                                ? `#${String(sale.orderNumber).padStart(4, '0')}`
                                                : sale.id.slice(0, 8)}
                                        </td>
                                        <td className="amount">${sale.totalPaid.toFixed(2)}</td>
                                        <td>
                                            {sale.payments.length > 1 ? (
                                                <span className="badge badge-split">Mixto ({sale.payments.length})</span>
                                            ) : (
                                                <span className={`badge badge-${sale.payments[0].method}`}>
                                                    {sale.payments[0].method === 'cash' ? 'Efectivo' : 'Tarjeta'}
                                                </span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`status-badge status-${sale.status.toLowerCase()}`}>
                                                {sale.status === 'VOID' ? 'ANULADA' : 'COMPLETADA'}
                                            </span>
                                        </td>
                                        <td>
                                            {sale.status !== 'VOID' && (
                                                <button
                                                    className="btn-void"
                                                    onClick={() => handleVoid(sale.id)}
                                                    title="Anular Venta"
                                                >
                                                    🚫
                                                </button>
                                            )}
                                            <button
                                                className="btn-view"
                                                onClick={() => setSelectedSale(sale)}
                                                title="Ver Detalle"
                                            >
                                                👁️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <SaleDetailModal
                isOpen={!!selectedSale}
                sale={selectedSale}
                onClose={() => setSelectedSale(null)}
            />

            <style jsx>{`
                .page-container {
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 24px;
                    height: 100vh;
                    overflow-y: auto;
                }

                .page-header {
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: var(--bg-card);
                }

                .page-header h1 {
                    font-size: 1.5rem;
                    color: var(--text-primary);
                    margin: 0;
                }

                .filters {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .period-select, input[type="date"] {
                    padding: 8px 12px;
                    border-radius: var(--radius-sm);
                    border: 1px solid var(--border-color);
                    background: var(--bg-primary);
                    color: var(--text-primary);
                    font-size: 0.9rem;
                }

                .date-inputs {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--text-secondary);
                }

                .stats-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                }

                .stat-card {
                    padding: 24px;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: var(--bg-card);
                }

                .stat-card h3 {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    margin: 0 0 8px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .stat-value {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0;
                    line-height: 1.2;
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    margin: 8px 0 0 0;
                }

                .table-container {
                    flex: 1;
                    overflow: auto;
                    border-radius: var(--radius-md);
                    border: 1px solid var(--border-color);
                    background: var(--bg-card);
                    padding: 20px;
                }

                .sales-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .sales-table th {
                    text-align: left;
                    padding: 12px 16px;
                    border-bottom: 2px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    font-weight: 600;
                }

                .sales-table td {
                    padding: 14px 16px;
                    border-bottom: 1px solid var(--border-color);
                    color: var(--text-primary);
                    font-size: 0.95rem;
                }

                .monospace { font-family: monospace; }
                .amount { font-weight: 600; }

                .empty-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--text-muted);
                }

                .badge {
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 0.75rem;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .badge-cash { background: #dcfce7; color: #166534; }
                .badge-card { background: #dbeafe; color: #1e40af; }
                .badge-split { background: #f3e8ff; color: #6b21a8; }

                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.75rem;
                    font-weight: 700;
                }
                .status-completed { color: var(--accent-success); }
                .status-void { color: var(--accent-danger); background: #fee2e2; }

                .voided-row td {
                    opacity: 0.6;
                    text-decoration: line-through;
                }
                .voided-row .status-badge { /* Don't strike through status */
                    text-decoration: none;
                    display: inline-block;
                    opacity: 1;
                }

                .btn-void {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    cursor: pointer;
                    padding: 6px;
                    transition: all 0.2s;
                }
                .btn-void:hover {
                    background: #fee2e2;
                    border-color: #ef4444;
                }

                .btn-view {
                    background: transparent;
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    cursor: pointer;
                    padding: 6px;
                    transition: all 0.2s;
                    margin-left: 8px; /* Spacing between buttons */
                }
                .btn-view:hover {
                    background: var(--bg-primary);
                    border-color: var(--accent-primary);
                }
                
                .loading { padding: 20px; color: var(--text-muted); }
            `}</style>
        </div>
    );
}
