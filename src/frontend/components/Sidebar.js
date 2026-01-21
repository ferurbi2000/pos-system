/**
 * @author Fernando Urbina
 * @description Navigation Sidebar Component
 */
'use client';
import Link from 'next/link';
import { useTheme } from '@/frontend/context/ThemeContext';

export default function Sidebar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <aside className="sidebar glass-panel">
      <div className="logo-container">
        <h1>POS System</h1>
      </div>

      <nav className="nav-menu">
        <Link href="/" className="nav-item">
          <span>🛒</span> Punto de Venta
        </Link>
        <Link href="/inventory" className="nav-item">
          <span>📦</span> Inventario
        </Link>
        <Link href="/reports" className="nav-item">
          <span>📊</span> Reportes
        </Link>
        <Link href="/sales" className="nav-item">
          <span>📜</span> Ventas
        </Link>
      </nav>

      <div className="theme-toggle-container">
        <button className="theme-btn" onClick={toggleTheme}>
          {theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
        </button>
      </div>

      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh; /* Full height */
          margin: 0;     /* Remove margin */
          border-radius: 0; /* Square corners */
          border-right: 1px solid var(--border-color);
          border-top: none;
          border-bottom: none;
          border-left: none;
          display: flex;
          flex-direction: column;
          padding: 24px;
          background: var(--bg-secondary); /* Distinct sidebar bg */
        }

        .logo-container {
          margin-bottom: 40px;
          padding-left: 12px;
        }

        .logo-container h1 {
          color: var(--text-primary); /* Use primary text, maybe accent for icon */
          font-size: 1.25rem;
          font-weight: 700;
        }

        .nav-menu {
          display: flex;
          flex-direction: column;
          gap: 4px; /* Tighter gap */
          flex: 1;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: var(--bg-primary);
          color: var(--text-primary);
          transform: none; /* Remove playful transform */
        }

        .theme-toggle-container {
          margin-top: auto;
          padding-top: 20px;
          border-top: 1px solid var(--border-color);
        }

        .theme-btn {
          width: 100%;
          padding: 10px;
          background: transparent;
          border: 1px solid var(--border-color);
          color: var(--text-secondary);
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.9rem;
        }

        .theme-btn:hover {
          background: var(--bg-primary);
          color: var(--text-primary);
          border-color: var(--text-secondary);
        }
      `}</style>
    </aside>
  );
}
