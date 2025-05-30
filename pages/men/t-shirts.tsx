import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import { Product } from '../../data/products';
import { FaSpinner } from 'react-icons/fa';
import styles from '../../styles/Products.module.css';
import { useCart } from '../../context/CartContext';
import QuickView from '../../components/QuickView';
import * as firestoreAPI from '../../utils/firestore';

export default function TShirtsPage() {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tshirtsProducts, setTshirtsProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Fetch t-shirts products from Firebase
  useEffect(() => {
    const fetchTShirts = async () => {
      try {
        setLoading(true);
        
        // Get t-shirts products from Firebase
        const products = await firestoreAPI.getProductsByCategory('t-shirts');
        
        // Filter for men's t-shirts only
        const mensTShirts = products.filter(product => 
          product.category.toLowerCase() === 'men' || 
          product.category.toLowerCase() === 'mens'
        );
        
        setTshirtsProducts(mensTShirts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching t-shirts:', err);
        setError('Failed to load t-shirts. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchTShirts();
  }, []);
  
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
    <Layout title="Men's T-Shirts">
      <div className="container" style={{ padding: '40px 0' }}>
        <h1>Men's T-Shirts</h1>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#721c24' }}>
            <p>{error}</p>
          </div>
        ) : tshirtsProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No t-shirts found. Please check back later.</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {tshirtsProducts.map(product => (
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