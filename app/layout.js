import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from '@/lib/CartContext';
import { AuthProvider } from '@/lib/AuthContext';
import { ThemeProvider } from '@/lib/ThemeContext';

export const metadata = {
  title: 'SAN MATTEO — QR Cafe Ordering System',
  description: 'Order your favorite food and drinks with our seamless QR-based cafe ordering system. Browse menu, add to cart, and place orders from your table.',
  keywords: 'cafe, ordering, QR code, food, drinks, restaurant',
  icons: {
    icon: '/SanMatteo-logo.jpeg',
    apple: '/SanMatteo-logo.jpeg',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              {children}
              <Toaster
                position="bottom-center"
                toastOptions={{
                  duration: 2000,
                  style: {
                    borderRadius: '12px',
                    background: '#2C1810',
                    color: '#F5EDE4',
                    fontSize: '14px',
                  },
                }}
              />
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
