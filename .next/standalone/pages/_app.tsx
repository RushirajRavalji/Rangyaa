import '../styles/globals.css';
import '../styles/animations.css';
import '../styles/MobileEnhancements.css';
import type { AppProps } from 'next/app';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AuthProvider } from '../context/AuthContext';
import { ProductProvider } from '../context/ProductContext';
import { CartProvider } from '../context/CartContext';
import { BannerProvider } from '../context/BannerContext';
import { products } from '../data/products';
import { initScrollAnimations, refreshAnimations } from '../utils/animation';

function initializeLocalStorage() {
  if (typeof window !== 'undefined') {
    // Check if products exist in localStorage
    if (!localStorage.getItem('rangya_products')) {
      // Initialize with sample products
      const now = new Date().toISOString();
      const initialProducts = products.map(product => ({
        ...product,
        createdAt: now,
        updatedAt: now
      }));
      
      localStorage.setItem('rangya_products', JSON.stringify(initialProducts));
      
      // Initialize categories from products
      const categoryCounts: Record<string, number> = {};
      products.forEach(product => {
        if (product.category) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });
      
      const categories = Object.entries(categoryCounts).map(([id, count]) => ({
        id,
        name: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
        count,
        createdAt: now,
        updatedAt: now
      }));
      
      localStorage.setItem('rangya_categories', JSON.stringify(categories));
    }

    // Initialize banners if they don't exist
    if (!localStorage.getItem('rangya_banners')) {
      // Default home page banners
      const now = new Date().toISOString();
      const initialBanners = [
        {
          id: 'banner1',
          page: 'home',
          imageUrl: '', // Empty by default - to be set by admin
          title: 'Men\'s Collection',
          subtitle: 'Explore our latest men\'s styles',
          textColor: '#ffffff',
          order: 1,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'banner2',
          page: 'home',
          imageUrl: '', // Empty by default - to be set by admin
          title: 'Premium Denim',
          subtitle: 'Quality jeans for every occasion',
          textColor: '#ffffff',
          order: 2,
          createdAt: now,
          updatedAt: now
        },
        {
          id: 'banner3',
          page: 'home',
          imageUrl: '', // Empty by default - to be set by admin
          title: 'Accessories',
          subtitle: 'Complete your look',
          textColor: '#ffffff',
          order: 3,
          createdAt: now,
          updatedAt: now
        }
      ];
      
      localStorage.setItem('rangya_banners', JSON.stringify(initialBanners));
    }
  }
}

function MyApp({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Initialize localStorage and set mounted state
  useEffect(() => {
    initializeLocalStorage();
    setMounted(true);
    
    // Initialize scroll animations
    const observer = initScrollAnimations();
    
    // Re-initialize on route changes
    const handleRouteChange = () => {
      setTimeout(() => {
        refreshAnimations();
      }, 100);
    };
    
    router.events.on('routeChangeComplete', handleRouteChange);
    
    // Clean up observer on component unmount
    return () => {
      if (observer) {
        observer.disconnect();
      }
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
  
  return (
    <div suppressHydrationWarning className="page-transition">
      <AuthProvider>
        <ProductProvider>
          <CartProvider>
            <BannerProvider>
              <Component {...pageProps} />
            </BannerProvider>
          </CartProvider>
        </ProductProvider>
      </AuthProvider>
    </div>
  );
}

export default MyApp; 