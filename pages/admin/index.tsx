import React, { useState } from 'react';
import { GetServerSideProps } from 'next';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';
import styles from '../../styles/AdminPanel.module.css';
import { clearAllProducts } from '../../utils/localStorage';
import ClientOnly from '../../components/ClientOnly';
import { FaBoxOpen, FaImages, FaShoppingCart, FaTrash, FaBroom } from 'react-icons/fa';

// Admin email for authorization
const ADMIN_EMAIL = 'driger.ray.dranzer@gmail.com';

export default function AdminIndex() {
  const { user } = useAuth();
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Handle clearing demo products
  const handleClearDemoProducts = () => {
    try {
      clearAllProducts();
      setMessage({
        type: 'success',
        text: 'All demo products have been removed successfully.'
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setMessage(null);
      }, 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to clear demo products. Please try again.'
      });
    }
  };

  // Only render content for authenticated admin users
  if (!user || user.email !== ADMIN_EMAIL) {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Panel</h1>
        <p className={styles.errorMessage}>
          You need to be logged in as an administrator to access this page.
        </p>
      </div>
    );
  }

  return (
    <ClientOnly>
      <div className={styles.container}>
        <h1 className={styles.title}>Admin Dashboard</h1>

        {message && (
          <div className={`${styles.message} ${styles[message.type]}`}>
            {message.text}
          </div>
        )}

        <div className={styles.adminGrid}>
          <Link href="/admin/products" className={styles.adminCard}>
            <FaBoxOpen className={styles.cardIcon} />
            <h2>Products</h2>
            <p>Manage your product catalog</p>
          </Link>

          <Link href="/admin/banners" className={styles.adminCard}>
            <FaImages className={styles.cardIcon} />
            <h2>Banners</h2>
            <p>Manage promotional banners</p>
          </Link>

          <Link href="/admin/orders" className={styles.adminCard}>
            <FaShoppingCart className={styles.cardIcon} />
            <h2>Orders</h2>
            <p>View and manage customer orders</p>
          </Link>
        </div>

        <div className={styles.adminUtilities}>
          <h2>Admin Utilities</h2>
          
          <div className={styles.utilityCard}>
            <div className={styles.utilityHeader}>
              <FaBroom className={styles.utilityIcon} />
              <h3>Clear Demo Products</h3>
            </div>
            <p>Remove all automatically added demo products from the website.</p>
            <button 
              className={`${styles.button} ${styles.dangerButton}`}
              onClick={handleClearDemoProducts}
            >
              <FaTrash /> Clear Demo Products
            </button>
          </div>
        </div>
      </div>
    </ClientOnly>
  );
} 