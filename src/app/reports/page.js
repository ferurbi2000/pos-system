'use client';
import { useSales } from '@/frontend/hooks/useSales';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useState, useMemo } from 'react';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function ReportsPage() {
  const { sales, loading } = useSales();
  const [trendChartType, setTrendChartType] = useState('line'); // 'line' or 'bar'

  // Process data for charts
  const { kpis, salesTrend, categorySales, paymentStats } = useMemo(() => {
    if (!sales || sales.length === 0) return {
      kpis: { total: 0, orders: 0, avg: 0 },
      salesTrend: [],
      categorySales: [],
      paymentStats: []
    };

    // Filter out voided sales
    const validSales = sales.filter(s => s.status !== 'VOID');

    // KPIs
    const totalRevenue = validSales.reduce((sum, s) => sum + s.total, 0);
    const totalOrders = validSales.length;
    const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Sales Trend (Group by Date)
    const trendMap = {};
    validSales.forEach(sale => {
      // Use sale.date (ISO string from SalesRepository)
      const dateObj = new Date(sale.date);
      const dateStr = dateObj.toLocaleDateString();
      trendMap[dateStr] = {
        raw: dateObj,
        total: (trendMap[dateStr]?.total || 0) + sale.total
      };
    });

    const salesTrend = Object.keys(trendMap)
      .map(dStr => ({
        date: dStr,
        raw: trendMap[dStr].raw,
        total: trendMap[dStr].total
      }))
      .sort((a, b) => a.raw - b.raw) // Sort chronologically
      .slice(-7); // Last 7 active days

    // Category Sales
    const catMap = {};
    validSales.forEach(sale => {
      sale.items.forEach(item => {
        // item.category might not be saved in item snapshot, fallback needed if item snapshot logic is simple
        // Assuming item snapshot has category, if not we might need to rely on looking up product?
        // Actually our cart items usually copy properties. Let's rely on that or simplify.
        // If category missing, group as "Other"
        const cat = item.category || 'Otros';
        catMap[cat] = (catMap[cat] || 0) + (item.price * item.quantity);
      });
    });
    const categorySales = Object.keys(catMap).map(name => ({
      name,
      value: catMap[name]
    }));

    // Payment Methods
    const payMap = { 'Efectivo': 0, 'Tarjetas': 0 };
    validSales.forEach(sale => {
      if (sale.payments) {
        sale.payments.forEach(p => {
          let method = p.method;
          // Normalize old data
          if (method === 'cash') method = 'Efectivo';
          if (method === 'card' || method === 'Tarjeta') method = 'Tarjetas';

          payMap[method] = (payMap[method] || 0) + p.amount;
        });
      }
    });

    // Filter out zero values if we want a cleaner chart, or keep them
    const paymentStats = Object.keys(payMap)
      .filter(name => payMap[name] > 0)
      .map(name => ({
        name,
        value: payMap[name]
      }));

    return {
      kpis: { total: totalRevenue, orders: totalOrders, avg: avgTicket },
      salesTrend,
      categorySales,
      paymentStats
    };
  }, [sales]);


  if (loading) return <div style={{ padding: 40 }}>Cargando reportes...</div>;

  return (
    <div className="reports-container">
      <header className="header">
        <h2>Reportes de Ventas</h2>
      </header>

      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card glass-panel">
          <h3>Ventas Totales</h3>
          <p className="kpi-value">${kpis.total.toFixed(2)}</p>
        </div>
        <div className="kpi-card glass-panel">
          <h3>Total Órdenes</h3>
          <p className="kpi-value">{kpis.orders}</p>
        </div>
        <div className="kpi-card glass-panel">
          <h3>Ticket Promedio</h3>
          <p className="kpi-value">${kpis.avg.toFixed(2)}</p>
        </div>
      </div>

      <div className="charts-grid">
        {/* Sales Trend */}
        <div className="chart-card glass-panel full-width">
          <div className="chart-header-row">
            <h3>Tendencia de Ventas</h3>
            <div className="chart-controls">
              <button
                className={`control-btn ${trendChartType === 'line' ? 'active' : ''}`}
                onClick={() => setTrendChartType('line')}
              >
                📈 Líneas
              </button>
              <button
                className={`control-btn ${trendChartType === 'bar' ? 'active' : ''}`}
                onClick={() => setTrendChartType('bar')}
              >
                📊 Barras
              </button>
            </div>
          </div>
          <div className="chart-container">
            {salesTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                {trendChartType === 'line' ? (
                  <LineChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <Line type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                ) : (
                  <BarChart data={salesTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis dataKey="date" stroke="var(--text-secondary)" />
                    <YAxis stroke="var(--text-secondary)" />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                    />
                    <Bar dataKey="total" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No hay suficientes datos de ventas</div>
            )}
          </div>
        </div>

        {/* Category Sales */}
        <div className="chart-card glass-panel">
          <h3>Ventas por Categoría</h3>
          <div className="chart-container">
            {categorySales.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categorySales} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                  <XAxis type="number" stroke="var(--text-secondary)" />
                  <YAxis type="category" dataKey="name" width={80} stroke="var(--text-secondary)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <Bar dataKey="value" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">Sin datos</div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="chart-card glass-panel">
          <h3>Métodos de Pago</h3>
          <div className="chart-container">
            {paymentStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {paymentStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">Sin datos</div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .reports-container {
          padding: 24px;
          height: 100vh;
          overflow-y: auto;
        }

        .header {
          margin-bottom: 24px;
        }

        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
          margin-bottom: 24px;
        }

        .kpi-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
        }

        .kpi-card h3 {
          font-size: 0.9rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .kpi-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .full-width {
          grid-column: 1 / -1;
        }

        .chart-card {
          padding: 24px;
          border-radius: var(--radius-md);
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          min-height: 400px;
          display: flex;
          flex-direction: column;
        }
        
        .chart-card h3 {
            margin-bottom: 0;
            font-size: 1.1rem;
        }

        .chart-header-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
        }

        .chart-controls {
            display: flex;
            background: var(--bg-primary);
            padding: 4px;
            border-radius: var(--radius-sm);
            gap: 4px;
        }

        .control-btn {
            padding: 6px 12px;
            border: none;
            background: transparent;
            color: var(--text-secondary);
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            border-radius: var(--radius-sm);
            transition: all 0.2s;
        }

        .control-btn.active {
            background: var(--bg-card);
            color: var(--accent-primary);
            box-shadow: var(--shadow-sm);
        }

        .chart-container {
          flex: 1;
          width: 100%;
          min-height: 300px;
        }

        .no-data {
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
