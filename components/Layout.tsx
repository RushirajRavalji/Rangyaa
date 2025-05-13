import { ReactNode, useState, useEffect } from 'react';
import Head from 'next/head';
import { FaCheckCircle, FaInfoCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

interface NotificationProps {
  message: string;
  isVisible: boolean;
  type: 'success' | 'info' | 'warning' | 'error';
}

const Layout = ({ 
  children, 
  title = "Nikhil's Jeans - Premium Clothing Store", 
  description = "Discover premium jeans and clothing at Nikhil's Jeans, designed for the modern individual."
}: LayoutProps) => {
  const [notification, setNotification] = useState<NotificationProps>({ 
    message: '', 
    isVisible: false,
    type: 'success'
  });
  const [pageLoading, setPageLoading] = useState(false);
  
  // Handle route change loading
  useEffect(() => {
    const handleRouteChangeStart = () => setPageLoading(true);
    const handleRouteChangeComplete = () => setPageLoading(false);
    const handleRouteChangeError = () => setPageLoading(false);

    if (typeof window !== 'undefined') {
      const router = require('next/router').default;
      router.events.on('routeChangeStart', handleRouteChangeStart);
      router.events.on('routeChangeComplete', handleRouteChangeComplete);
      router.events.on('routeChangeError', handleRouteChangeError);

      return () => {
        router.events.off('routeChangeStart', handleRouteChangeStart);
        router.events.off('routeChangeComplete', handleRouteChangeComplete);
        router.events.off('routeChangeError', handleRouteChangeError);
      };
    }
  }, []);
  
  // Global notification system that can be accessed via window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add showNotification method to window object
      window.showNotification = (
        message: string, 
        type: 'success' | 'info' | 'warning' | 'error' = 'success'
      ) => {
        setNotification({ message, isVisible: true, type });
        setTimeout(() => {
          setNotification(prev => ({ ...prev, isVisible: false }));
        }, 4000);
      };
    }

    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.showNotification;
      }
    };
  }, []);

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FaCheckCircle />;
      case 'info':
        return <FaInfoCircle />;
      case 'warning':
      case 'error':
        return <FaExclamationTriangle />;
      default:
        return <FaCheckCircle />;
    }
  };

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>
      <Header />
      <main>
        {pageLoading && (
          <div className="page-loading">
            <div className="loader"></div>
          </div>
        )}
        {children}
      </main>
      <Footer />
      <div className={`notification ${notification.isVisible ? 'show' : ''} ${notification.type}`}>
        <div className="notification-icon">
          {getNotificationIcon()}
        </div>
        <div className="notification-content">
          <span>{notification.message}</span>
        </div>
        <button className="notification-close" onClick={closeNotification}>
          <FaTimes />
        </button>
      </div>
    </>
  );
};

// Extend Window interface to include showNotification
declare global {
  interface Window {
    showNotification: (
      message: string, 
      type?: 'success' | 'info' | 'warning' | 'error'
    ) => void;
  }
}

export default Layout; 