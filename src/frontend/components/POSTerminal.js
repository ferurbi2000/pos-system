/**
 * @author Fernando Urbina
 * @description POS Terminal Component
 */
'use client';
import { useState, useEffect } from 'react';
import { useProducts } from '@/frontend/hooks/useProducts';
import ProductCard from './ProductCard';
import PaymentModal from './PaymentModal';
import { useSales } from '@/frontend/hooks/useSales';
import { categories as defaultCategories } from '@/lib/data';

export default function POSTerminal() {
  const { products, loading, refresh } = useProducts();
  const { sales, addSale } = useSales();
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Combine default categories with any new ones found in products
  // defaultCategories already includes "Todos"
  const productCategories = new Set(products.map(p => p.category));
  const mergedCategories = new Set(['Todos', ...defaultCategories, ...productCategories]);
  const categories = Array.from(mergedCategories);

  // Calculate next order number based on MAX existing order number
  const maxOrderNumber = sales.reduce((max, sale) => Math.max(max, sale.orderNumber || 0), 0);
  const nextOrderNumber = maxOrderNumber + 1;
  const formattedOrderNumber = String(nextOrderNumber).padStart(4, '0');

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === "Todos" || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    const currentQty = existing ? existing.quantity : 0;

    if (currentQty + 1 > product.stock) {
      alert(`No hay suficiente stock de ${product.name}. Disponible: ${product.stock}`);
      return;
    }

    setCart(prev => {
      const existingInPrev = prev.find(item => item.id === product.id);
      if (existingInPrev) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, delta) => {
    if (delta > 0) {
      const item = cart.find(item => item.id === productId);
      // Ensure item exists and check stock
      if (item && item.quantity + delta > item.stock) {
        alert(`No puedes agregar más. Stock máximo: ${item.stock}`);
        return;
      }
    }

    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };


  const handlePayment = async ({ payments, totalPaid, change }) => {
    // Determine primary method for simple logging, or "split"
    const method = payments.length > 1 ? "Mixto/Parcial" : payments[0].method;

    // Save Sale to Backend
    try {
      await addSale({
        items: cart,
        total,
        totalPaid,
        change,
        payments
      });

      let message = `Pago exitoso! Orden #${formattedOrderNumber}\nTotal: $${total.toFixed(2)}\n`;
      message += `Pagado: $${totalPaid.toFixed(2)}\n`;
      if (change > 0) message += `Cambio: $${change.toFixed(2)}\n`;
      message += `\nDetalle:\n${payments.map(p => `- ${p.method}: $${p.amount.toFixed(2)}`).join('\n')}`;

      alert(message);
      setCart([]);
      setIsPaymentModalOpen(false);
      refresh(); // Refresh inventory
    } catch (err) {
      alert("Error al guardar la venta: " + err.message);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <div className="pos-container">
      {/* Left Side: Product Grid */}
      <div className="products-section">
        <header className="products-header glass-panel">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="categories">
            {categories.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </header>

        <div className="products-grid">
          {loading ? (
            <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Cargando productos...</div>
          ) : (
            filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={addToCart} />
            ))
          )}
        </div>
      </div>

      {/* Right Side: Cart */}
      <div className="cart-section glass-panel">
        <div className="cart-header">
          <h2>Orden Actual</h2>
          <span className="order-id">#{formattedOrderNumber}</span>
        </div>

        <div className="cart-items">
          {cart.length === 0 ? (
            <div className="empty-cart">
              <p>El carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                <div className="item-info">
                  <h4>{item.name}</h4>
                  <p>${item.price.toFixed(2)}</p>
                </div>
                <div className="item-controls">
                  <button onClick={() => updateQuantity(item.id, -1)}>-</button>
                  <span>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>+</button>
                </div>
                <button className="delete-btn" onClick={() => removeFromCart(item.id)}>×</button>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="total-row">
            <span>Total</span>
            <span className="total-amount">${total.toFixed(2)}</span>
          </div>
          <button
            className="btn btn-primary checkout-btn"
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
          >
            Procesar Pago
          </button>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={total}
        onConfirm={handlePayment}
      />

      <style jsx>{`
        .pos-container {
          display: grid;
          grid-template-columns: 1fr 380px; /* Wider cart */
          gap: 24px;
          height: 100%;
        }

        .products-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
          overflow: hidden;
        }

        .products-header {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          background: var(--bg-card); /* Ensure solid bg */
        }

        .search-input {
          width: 100%;
          padding: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
        }

        .categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
          /* Hide scrollbar for standard browsers */
          scrollbar-width: none; 
          -ms-overflow-style: none;
        }

        /* Hide scrollbar for Chrome/Safari/Opera */
        .categories::-webkit-scrollbar {
          display: none;
        }

        .category-btn {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          padding: 8px 16px;
          border-radius: var(--radius-sm); /* Less rounded */
          cursor: pointer;
          white-space: nowrap;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .category-btn:hover {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .category-btn.active {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
          overflow-y: auto;
          padding-bottom: 20px;
        }

        /* Cart Styles */
        .cart-section {
          display: flex;
          flex-direction: column;
          height: 100%; /* Full height */
          margin: 0;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }

        .cart-header {
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: var(--bg-secondary); /* Header distinction */
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }

        .cart-header h2 {
            font-size: 1.1rem;
        }

        .order-id {
            font-family: monospace;
            color: var(--text-muted);
        }

        .cart-items {
          flex: 1;
          overflow-y: auto;
          padding: 20px;
        }

        .cart-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          background: var(--bg-primary);
          padding: 12px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
        }

        .item-info {
          flex: 1;
        }

        .item-info h4 {
          font-size: 0.9rem;
          margin-bottom: 4px;
          color: var(--text-primary);
        }

        .item-info p {
            color: var(--text-muted);
            font-size: 0.85rem;
        }

        .item-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 12px;
        }

        .item-controls button {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-color);
          background: var(--bg-card);
          color: var(--text-primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .item-controls button:hover {
            border-color: var(--accent-primary);
            color: var(--accent-primary);
        }

        .delete-btn {
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.2rem;
          transition: color 0.2s;
        }
        
        .delete-btn:hover {
            color: var(--accent-danger);
        }

        .cart-footer {
          padding: 24px;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          border-radius: 0 0 var(--radius-md) var(--radius-md);
        }

        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 20px;
          color: var(--text-primary);
        }

        .total-amount {
          color: var(--accent-primary);
        }

        .checkout-btn {
          width: 100%;
          padding: 16px;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        input[type="text"] {
            width: 100%;
            padding: 12px;
            border-radius: var(--radius-sm);
            border: 1px solid var(--border-color);
            background: var(--bg-primary);
            color: var(--text-primary);
            font-size: 0.95rem;
        }
        
        input[type="text"]:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}
