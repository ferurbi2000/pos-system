/**
 * @author Fernando Urbina
 * @description Inventory Management Page
 */
'use client';
import { useState, useMemo } from 'react';
import { useProducts } from '@/frontend/hooks/useProducts';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, loading, error } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    image: ''
  });

  const availableCategories = useMemo(() => {
    const defaultCats = ['Bebidas', 'Panadería', 'Postres', 'Comida'];
    const activeCats = [...new Set(products.map(p => p.category))];
    return [...new Set([...defaultCats, ...activeCats])].sort();
  }, [products]);

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  const handleEdit = (product) => {
    setFormData({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      image: product.image || ''
    });
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', stock: '', category: '', image: '' });
    setEditingId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category || formData.category === 'NEW_CAT') {
      alert("Por favor selecciona o ingresa una categoría válida");
      return;
    }
    try {
      if (editingId) {
        await updateProduct(editingId, formData);
      } else {
        await addProduct(formData);
      }
      handleCloseModal();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.url }));
    } catch (err) {
      alert("Error uploading image: " + err.message);
    }
  };

  return (
    <div className="inventory-container">
      <div className="header">
        <h2>Gestión de Inventario</h2>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          + Nuevo Producto
        </button>
      </div>

      <div className="glass-panel table-container">
        {loading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Cargando inventario...</div>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id}>
                  <td>
                    <div className="product-cell">
                      {product.image && (
                        <img src={product.image} alt="" className="product-thumb" />
                      )}
                      <span>{product.name}</span>
                    </div>
                  </td>
                  <td>{product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>
                    <span className={`stock-tag ${product.stock < 10 ? 'low' : ''}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td>
                    <button className="action-btn edit" onClick={() => handleEdit(product)}>
                      Editar
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(product.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel">
            <div className="modal-header">
              <h2>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Nombre del Producto</label>
                  <input
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Café Espresso"
                  />
                </div>

                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    required
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="">Selecciona una categoría</option>
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {formData.category && !availableCategories.includes(formData.category) && formData.category !== 'NEW_CAT' && (
                      <option value={formData.category}>{formData.category}</option>
                    )}
                    <option value="NEW_CAT">+ Nueva Categoría</option>
                  </select>
                  {formData.category === 'NEW_CAT' && (
                    <input
                      placeholder="Nombre de la nueva categoría"
                      style={{ marginTop: '8px' }}
                      autoFocus
                      onBlur={(e) => {
                        if (e.target.value) {
                          setFormData({ ...formData, category: e.target.value });
                        } else {
                          setFormData({ ...formData, category: '' });
                        }
                      }}
                    />
                  )}
                </div>

                <div className="form-group">
                  <label>Imagen</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                      value={formData.image}
                      onChange={e => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                      style={{ flex: 1 }}
                    />
                    <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0, padding: '8px 16px', fontSize: '0.85rem' }}>
                      Subir 📁
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  </div>
                  {formData.image && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={formData.image} alt="Preview" style={{ height: '80px', borderRadius: '4px', objectFit: 'cover', border: '1px solid var(--border-color)' }} />
                    </div>
                  )}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Precio</label>
                    <input
                      type="number" step="0.01" required
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="form-group">
                    <label>Stock Inicial</label>
                    <input
                      type="number" required
                      value={formData.stock}
                      onChange={e => setFormData({ ...formData, stock: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar Producto' : 'Guardar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .inventory-container {
          padding: 24px;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .table-container {
          padding: 0; 
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-sm);
        }

        .inventory-table {
          width: 100%;
          border-collapse: collapse;
        }

        .inventory-table th, .inventory-table td {
          padding: 16px 24px;
          text-align: left;
          border-bottom: 1px solid var(--border-color);
        }

        .inventory-table th {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-weight: 600;
          font-size: 0.85rem;
          text-transform: uppercase;
        }

        .inventory-table tr:last-child td {
          border-bottom: none;
        }
        
        .inventory-table tr:hover td {
            background: var(--bg-primary);
        }

        .product-cell {
            display: flex;
            align-items: center;
            gap: 12px;
        }

        .product-thumb {
            width: 32px;
            height: 32px;
            border-radius: 4px;
            object-fit: cover;
            background: #eee;
        }

        .stock-tag {
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          background: rgba(16, 185, 129, 0.1);
          color: var(--accent-success);
        }

        .stock-tag.low {
          background: rgba(239, 68, 68, 0.1);
          color: var(--accent-danger);
        }

        .action-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: color 0.2s;
          margin-right: 12px;
        }

        .action-btn.edit {
            color: var(--accent-primary);
        }
        
        .action-btn.edit:hover {
            text-decoration: underline;
        }

        .action-btn.delete {
          color: var(--text-muted);
        }
        
        .action-btn.delete:hover {
            color: var(--accent-danger);
        }

        /* Modal */
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
          max-width: 500px;
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
          align-items: center;
          background: var(--bg-secondary);
        }

        .modal-header h2 { 
            margin: 0; 
            font-size: 1.25rem; 
            color: var(--text-primary);
        }

        .close-btn { 
            background: none; 
            border: none; 
            font-size: 1.5rem; 
            cursor: pointer; 
            color: var(--text-muted); 
            display: flex;
            align-items: center;
            justify-content: center;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            transition: background 0.2s;
        }
        
        .close-btn:hover {
            background: var(--bg-primary);
            color: var(--text-primary);
        }

        .modal-body {
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
            overflow-y: auto;
        }

        .modal-footer {
            padding: 20px;
            border-top: 1px solid var(--border-color);
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            background: var(--bg-secondary);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .form-group input, .form-group select {
          width: 100%;
          padding: 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        
        .form-group select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E%22);
            background-repeat: no-repeat;
            background-position: right 12px center;
            background-size: 16px;
            padding-right: 40px;
        }

        .form-group input:focus, .form-group select:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-row {
          display: flex;
          gap: 20px;
        }

        .btn {
            padding: 10px 20px;
            border-radius: var(--radius-sm);
            font-weight: 600;
            font-size: 0.9rem;
            cursor: pointer;
            transition: all 0.2s;
            border: 1px solid transparent;
        }

        .btn-primary {
            background: var(--accent-primary);
            color: white;
        }

        .btn-primary:hover {
            background: var(--accent-hover);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: transparent;
            border: 1px solid var(--border-color);
            color: var(--text-secondary);
        }

        .btn-secondary:hover {
            background: var(--bg-primary);
            color: var(--text-primary);
            border-color: var(--text-secondary);
        }
      `}</style>
    </div>
  );
}
