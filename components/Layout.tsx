import { useState, useEffect, ReactNode } from 'react';
import Head from 'next/head';
import { FaArrowUp } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';
import styles from '../styles/Layout.module.css';
import ClientOnly from './ClientOnly';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  isAdmin?: boolean;
}

const Layout = ({ 
  children, 
  title = "Nikhil's Jeans - Premium Denim & Apparel",
  description = "Shop premium quality jeans, shirts, and accessories at Nikhil's Jeans. Free shipping on orders over ₹999.",
  keywords = "jeans, denim, shirts, t-shirts, men's clothing, women's clothing, fashion, apparel",
  ogImage = "/images/og-image.jpg",
  isAdmin = false
}: LayoutProps) => {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate page loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);

    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    // Add notification function to window
    window.showNotification = (message: string, type = 'success') => {
      const notification = document.createElement('div');
      notification.className = `notification ${type}`;
      
      const content = document.createElement('div');
      content.className = 'notification-content';
      content.textContent = message;
      
      const closeBtn = document.createElement('button');
      closeBtn.className = 'notification-close';
      closeBtn.innerHTML = '&times;';
      closeBtn.onclick = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      };
      
      notification.appendChild(content);
      notification.appendChild(closeBtn);
      document.body.appendChild(notification);
      
      // Show notification
      setTimeout(() => notification.classList.add('show'), 10);
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
      }, 5000);
    };

    return () => {
      clearTimeout(timer);
      window.removeEventListener('scroll', handleScroll);
      // @ts-ignore
      delete window.showNotification;
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={ogImage} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {isLoading ? (
        <div className={styles.pageLoading}>
          <div className={styles.loader}></div>
        </div>
      ) : (
        <>
          <ClientOnly>
            <Header />
          </ClientOnly>
          
          <main className={`${isAdmin ? styles.adminMain : styles.main} fade-in`}>
            {children}
          </main>
          
          <Footer />
          
          {showScrollButton && (
            <button 
              className={styles.scrollToTop} 
              onClick={scrollToTop}
              aria-label="Scroll to top"
            >
              <FaArrowUp />
            </button>
          )}
        </>
      )}
    </>
  );
};

// Add type definition for window object
declare global {
  interface Window {
    showNotification: (message: string, type?: string) => void;
  }
}

export default Layout; 