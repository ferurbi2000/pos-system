'use client';
import { useState, useEffect } from 'react';

export function useSales() {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSales = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/sales');
            if (!res.ok) throw new Error('Failed to fetch sales');
            const data = await res.json();
            setSales(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSales();
    }, []);

    const addSale = async (saleData) => {
        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(saleData),
            });
            if (!res.ok) throw new Error('Failed to record sale');
            const newSale = await res.json();
            setSales(prev => [newSale, ...prev]);
            return newSale;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const voidSale = async (id) => {
        try {
            const res = await fetch(`/api/sales/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'VOID' }),
            });
            if (!res.ok) throw new Error('Failed to void sale');

            // Optimistic update
            setSales(prev => prev.map(s =>
                s.id === id ? { ...s, status: 'VOID' } : s
            ));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { sales, loading, error, addSale, voidSale, refresh: fetchSales };
}
