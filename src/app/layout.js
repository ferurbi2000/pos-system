import './globals.css';
import Sidebar from '@/frontend/components/Sidebar';
import { ThemeProvider } from '@/frontend/context/ThemeContext';

export const metadata = {
  title: 'Modern POS System',
  description: 'Point of Sale System',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <div className="grid-layout">
            <Sidebar />
            <main className="main-content">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
