'use client';
import { useState, useEffect } from 'react';

export function useProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchProducts = async () => {
        try {
            // Don't set loading to true on background refreshes to avoid UI flickering
            // only set it on initial load if products is empty
            if (products.length === 0) setLoading(true);

            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to fetch products');
            const data = await res.json();
            setProducts(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchProducts();

        // Broadcast Channel for cross-tab sync
        const channel = new BroadcastChannel('product_updates');

        channel.onmessage = (event) => {
            if (event.data === 'update') {
                fetchProducts();
            }
        };

        // Window focus listener to catch updates when returning to tab
        const onFocus = () => {
            fetchProducts();
        };

        window.addEventListener('focus', onFocus);

        return () => {
            channel.close();
            window.removeEventListener('focus', onFocus);
        };
    }, []);

    const notifyUpdates = () => {
        const channel = new BroadcastChannel('product_updates');
        channel.postMessage('update');
        channel.close();
    };

    const addProduct = async (productData) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!res.ok) throw new Error('Failed to add product');
            const newProduct = await res.json();
            setProducts(prev => [...prev, newProduct]);
            notifyUpdates();
            return newProduct;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const deleteProduct = async (id) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete product');
            setProducts(prev => prev.filter(p => p.id !== id));
            notifyUpdates();
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const updateProduct = async (id, productData) => {
        try {
            const res = await fetch(`/api/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(productData),
            });
            if (!res.ok) throw new Error('Failed to update product');
            const updated = await res.json();
            setProducts(prev => prev.map(p => p.id === id ? updated : p));
            notifyUpdates();
            return updated;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { products, loading, error, addProduct, updateProduct, deleteProduct, refresh: () => { fetchProducts(); notifyUpdates(); } };
}
