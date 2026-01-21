'use client';
import Image from 'next/image';

export default function ProductCard({ product, onAdd }) {
  return (
    <div className="product-wrapper" onClick={() => onAdd(product)}>
      <div className="image-card">
        <img
          src={product.image}
          alt={product.name}
          className="product-image"
        />
        <span className="stock-badge">Stock: {product.stock}</span>
      </div>

      <div className="product-details">
        <h3>{product.name}</h3>
        <p className="price">${product.price.toFixed(2)}</p>
      </div>

      <style jsx>{`
        .product-wrapper {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: transparent; /* No background on wrapper */
          border: none;
          padding: 0;
          transition: opacity 0.2s;
        }
        
        .product-wrapper:active {
            opacity: 0.8;
            transform: scale(0.98);
        }

        .image-card {
          width: 100%;
          aspect-ratio: 4/3; /* Consistent aspect ratio */
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--bg-card);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          position: relative;
          border: 1px solid var(--border-color);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .product-wrapper:hover .image-card {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border-color: var(--accent-primary);
        }

        .product-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        
        .product-wrapper:hover .product-image {
            transform: scale(1.05);
        }

        .product-details {
          padding: 0 4px;
        }

        .product-details h3 {
          font-size: 0.95rem;
          font-weight: 500;
          margin-bottom: 4px;
          color: var(--text-primary);
          line-height: 1.4;
          
          /* Show full name or truncate nicely */
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 2; /* Allow 2 lines */
          -webkit-box-orient: vertical;
        }

        .price {
          color: var(--text-primary);
          font-weight: 700;
          font-size: 1rem;
          opacity: 0.9;
        }

        .stock-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 0.75rem;
          color: white;
          font-weight: 600;
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
