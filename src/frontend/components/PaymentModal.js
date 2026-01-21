'use client';
import { useState, useEffect } from 'react';

export default function PaymentModal({ isOpen, onClose, total, onConfirm }) {
    const [payments, setPayments] = useState([]); // Array of { method: 'cash' | 'card', amount: number }
    const [currentAmount, setCurrentAmount] = useState('');
    const [currentMethod, setCurrentMethod] = useState('Efectivo');

    useEffect(() => {
        if (isOpen) {
            setPayments([]);
            setCurrentAmount(total.toFixed(2));
            setCurrentMethod('Efectivo');
        }
    }, [isOpen, total]);

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = Math.max(0, total - totalPaid);
    const change = Math.max(0, totalPaid - total);

    // Update default amount when remaining changes
    useEffect(() => {
        if (remaining > 0) {
            setCurrentAmount(remaining.toFixed(2));
        } else {
            setCurrentAmount('');
        }
    }, [remaining]);

    const handleAddPayment = () => {
        const amount = parseFloat(currentAmount);
        if (isNaN(amount) || amount <= 0) return;

        // For card, we can't pay more than remaining
        if (currentMethod === 'Tarjetas' && amount > remaining + 0.01) { // 0.01 tolerance
            alert("No se puede pagar más del restante con tarjeta.");
            return;
        }

        setPayments([...payments, { method: currentMethod, amount }]);
        // Reset inputs handled by useEffect roughly, but let's be explicit
    };

    const removePayment = (index) => {
        const newPayments = [...payments];
        newPayments.splice(index, 1);
        setPayments(newPayments);
    };

    const handleConfirm = () => {
        onConfirm({ payments, totalPaid, change });
    };

    const isComplete = remaining <= 0.01; // Tolerance for floating point

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content glass-panel">
                <div className="modal-header">
                    <h2>Procesar Pago</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Totals Summary */}
                    <div className="summary-section">
                        <div className="summary-row">
                            <span>Total:</span>
                            <span className="amount">${total.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Pagado:</span>
                            <span className="amount">${totalPaid.toFixed(2)}</span>
                        </div>
                        <div className="summary-row highlight">
                            <span>Restante:</span>
                            <span className={`amount ${remaining > 0 ? 'warning' : 'success'}`}>
                                ${remaining.toFixed(2)}
                            </span>
                        </div>
                        {change > 0 && (
                            <div className="summary-row change">
                                <span>Cambio:</span>
                                <span className="amount negative-margin">${change.toFixed(2)}</span>
                            </div>
                        )}
                    </div>

                    {/* Payment Input Section - Only show if still remaining */}
                    {remaining > 0.01 && (
                        <div className="input-section">
                            <h3>Agregar Pago</h3>
                            <div className="method-selector">
                                <button
                                    className={`method-btn ${currentMethod === 'Efectivo' ? 'active' : ''}`}
                                    onClick={() => setCurrentMethod('Efectivo')}
                                >
                                    💵 Efectivo
                                </button>
                                <button
                                    className={`method-btn ${currentMethod === 'Tarjetas' ? 'active' : ''}`}
                                    onClick={() => setCurrentMethod('Tarjetas')}
                                >
                                    💳 Tarjeta
                                </button>
                            </div>

                            <div className="amount-input-row">
                                <div className="input-wrapper">
                                    <span>$</span>
                                    <input
                                        type="number"
                                        value={currentAmount}
                                        onChange={(e) => setCurrentAmount(e.target.value)}
                                        placeholder="0.00"
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddPayment()}
                                    />
                                </div>
                                <button className="btn btn-add" onClick={handleAddPayment}>
                                    Agregar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Payment Log */}
                    <div className="payment-log">
                        <h3>Pagos Registrados</h3>
                        {payments.length === 0 ? (
                            <p className="empty-log">No hay pagos registrados</p>
                        ) : (
                            <ul>
                                {payments.map((p, i) => (
                                    <li key={i}>
                                        <span className="log-method">
                                            {p.method === 'Efectivo' ? '💵 Efectivo' : '💳 Tarjeta'}
                                        </span>
                                        <span className="log-amount">${p.amount.toFixed(2)}</span>
                                        <button className="remove-btn" onClick={() => removePayment(i)}>×</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>Cancelar</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleConfirm}
                        disabled={!isComplete}
                    >
                        Confirmar ({payments.length})
                    </button>
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
          width: 90%;
          max-width: 500px; /* Slightly wider */
          background: var(--bg-card);
          border-radius: var(--radius-md);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-xl);
          display: flex;
          flex-direction: column;
          max-height: 90vh; /* Prevent overflow on small screens */
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary);
        }

        .modal-header h2 { margin: 0; font-size: 1.25rem; }
        .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-muted); }

        .modal-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 24px;
            overflow-y: auto;
        }

        .summary-section {
            background: var(--bg-primary);
            padding: 16px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-color);
        }

        .summary-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 1rem;
        }

        .summary-row.highlight {
            font-weight: 700;
            font-size: 1.1rem;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 1px dashed var(--border-color);
        }

        .summary-row.change {
            margin-top: 8px;
            color: var(--accent-success);
            font-weight: 700;
            font-size: 1.1rem;
        }
        
        .amount.warning { color: var(--accent-danger); }
        .amount.success { color: var(--accent-success); }

        .input-section h3, .payment-log h3 {
            font-size: 1rem;
            margin-bottom: 12px;
            color: var(--text-secondary);
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.5px;
        }

        .method-selector {
            display: flex;
            gap: 12px;
            margin-bottom: 12px;
        }

        .method-btn {
            flex: 1;
            padding: 10px;
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-secondary);
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s;
        }

        .method-btn.active {
            background: var(--accent-primary);
            color: white;
            border-color: var(--accent-primary);
        }

        .amount-input-row {
            display: flex;
            gap: 12px;
            height: 42px;
        }

        .input-wrapper {
            flex: 1;
            display: flex;
            align-items: center;
            background: var(--bg-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            padding-left: 12px;
        }

        .input-wrapper input {
            flex: 1;
            border: none;
            background: transparent;
            font-size: 1.1rem;
            padding: 8px;
            color: var(--text-primary);
            outline: none;
        }

        .btn-add {
            padding: 0 20px;
            background: var(--bg-secondary);
            color: var(--text-primary);
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            cursor: pointer;
            font-weight: 500;
        }
        .btn-add:hover { background: var(--border-color); }

        .payment-log ul {
            list-style: none;
            padding: 0;
            margin: 0;
            border: 1px solid var(--border-color);
            border-radius: var(--radius-sm);
            overflow: hidden;
        }

        .payment-log li {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 16px;
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border-color);
        }
        .payment-log li:last-child { border-bottom: none; }

        .log-method { flex: 1; }
        .log-amount { font-family: monospace; font-weight: 600; margin-right: 12px;}

        .remove-btn {
            background: none;
            border: none;
            color: var(--accent-danger);
            cursor: pointer;
            font-size: 1.2rem;
            padding: 0 4px;
        }

        .empty-log {
            font-style: italic;
            color: var(--text-muted);
            text-align: center;
            margin: 20px 0;
        }

        .modal-footer {
            padding: 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background: var(--bg-secondary);
        }

        .btn {
            padding: 12px 24px;
            border-radius: var(--radius-sm);
            border: none;
            cursor: pointer;
            font-weight: 600;
            font-size: 1rem;
        }
        
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-secondary { background: transparent; color: var(--text-secondary); border: 1px solid var(--border-color); }
        .btn-primary { background: var(--accent-primary); color: white; }
      `}</style>
        </div>
    );
}
