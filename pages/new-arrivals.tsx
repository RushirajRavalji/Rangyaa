import { useState } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { useProducts } from '../context/ProductContext';
import { FaSpinner } from 'react-icons/fa';
import styles from '../styles/Products.module.css';
import Link from 'next/link';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import QuickView from '../components/QuickView';

export default function NewArrivalsPage() {
  const { loading, error, products } = useProducts();
  const { addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Get the 8 most recently added products
  // First, create a copy of the products array
  const sortedProducts = [...products];
  
  // Sort by createdAt date in descending order (newest first)
  sortedProducts.sort((a, b) => {
    // If either product doesn't have a createdAt, fallback to using the id (assuming higher id = newer)
    if (!a.createdAt || !b.createdAt) {
      return b.id.localeCompare(a.id);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
  
  // Take only the first 8 products
  const newArrivals = sortedProducts.slice(0, 8);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(`${product.name} added to cart`);
    }
  };

  return (
    <Layout title="New Arrivals">
      <Hero 
        page="new-arrivals"
        heading="New Arrivals"
        subheading="Check out our newest additions to the collection"
        height="medium"
        backgroundImage="/images/hero-new-arrivals.jpg"
        buttonText="Shop Now"
        buttonLink="#new-products"
      />

      <div className="container" style={{ padding: '40px 0' }} id="new-products">
        <div className={styles.sectionInfo}>
          <h2>Latest Products</h2>
          <p>Check out our newest additions to the collection</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
            <p>Loading new arrivals...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#721c24' }}>
            <p>{error}</p>
          </div>
        ) : newArrivals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No new arrivals found. Please check back later.</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {newArrivals.map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                onQuickView={handleQuickView}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* QuickView Modal */}
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={closeQuickView} />
      )}
    </Layout>
  );
} 