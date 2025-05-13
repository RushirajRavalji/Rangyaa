import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { CartProvider } from '../context/CartContext';
import { AuthProvider } from '../context/AuthContext';
import '../styles/globals.css';
// Import Firebase - no need to use it directly here as it's initialized in the module
import '../utils/firebase';

export default function App({ Component, pageProps }: AppProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  }, []);

  return (
    <AuthProvider>
      <CartProvider>
        {isLoading ? (
          <div className="loading-screen">
            <div className="spinner"></div>
          </div>
        ) : (
          <Component {...pageProps} />
        )}
      </CartProvider>
    </AuthProvider>
  );
} 