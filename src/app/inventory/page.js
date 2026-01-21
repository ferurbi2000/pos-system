'use client';
import { useState } from 'react';
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
          <div className="modal glass-panel">
            <h3>{editingId ? 'Editar Producto' : 'Agregar Producto'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre</label>
                <input
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Categoría</label>
                <input
                  required
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  list="categories-list"
                />
                <datalist id="categories-list">
                  <option value="Bebidas" />
                  <option value="Panadería" />
                  <option value="Postres" />
                  <option value="Comida" />
                </datalist>
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
                  <label className="btn btn-secondary" style={{ cursor: 'pointer', margin: 0 }}>
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
                    <img src={formData.image} alt="Preview" style={{ height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
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
                  />
                </div>
                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number" required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn" onClick={handleCloseModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Actualizar' : 'Guardar'}
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
          background: rgba(0,0,0,0.5); 
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal {
          width: 450px;
          padding: 32px;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-md);
          border: 1px solid var(--border-color);
        }
        
        .modal h3 {
            margin-bottom: 24px;
            font-size: 1.25rem;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 8px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 10px 12px;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.95rem;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: var(--accent-primary);
            box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .form-row {
          display: flex;
          gap: 20px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 32px;
        }
      `}</style>
    </div>
  );
}
