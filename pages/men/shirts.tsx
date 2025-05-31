import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import ProductCard from '../../components/ProductCard';
import { Product } from '../../data/products';
import { FaSpinner } from 'react-icons/fa';
import styles from '../../styles/Products.module.css';
import { useCart } from '../../context/CartContext';
import QuickView from '../../components/QuickView';
import * as firestoreAPI from '../../utils/firestore';

export default function ShirtsPage() {
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shirtsProducts, setShirtsProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Fetch shirts products on client side
  useEffect(() => {
    const fetchShirts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all products from Firebase
        const allProducts = await firestoreAPI.getAllProducts();
        console.log(`Fetched ${allProducts.length} total products, filtering for men's shirts`);
        
        // Improved filtering for men's shirts
        const mensShirts = allProducts.filter(product => {
          console.log(`Processing product: ${product.id} - ${product.name} - Category: ${product.category} - Subcategory: ${product.subcategory || 'none'} - Tags: ${product.tags?.join(', ') || 'none'}`);
          
          // Check if it's a men's product
          const isMensProduct = product.category?.toLowerCase() === 'men' || 
                               product.category?.toLowerCase() === 'mens' || 
                               product.subcategory?.toLowerCase()?.includes('men') ||
                               (product.tags && product.tags.some(tag => 
                                 tag.toLowerCase() === 'men' || 
                                 tag.toLowerCase() === 'mens' ||
                                 tag.toLowerCase().startsWith('men-')
                               ));
          
          // Check if it's a shirt
          const isShirt = product.subcategory?.toLowerCase()?.includes('shirt') || 
                         product.category?.toLowerCase() === 'shirts' || 
                         product.category?.toLowerCase() === 'shirt' ||
                         (product.tags && product.tags.some(tag => 
                           tag.toLowerCase() === 'shirt' ||
                           tag.toLowerCase().includes('shirt')
                         ));
          
          // Must be both men's product and a shirt, but not a t-shirt
          const isNotTShirt = !(product.subcategory?.toLowerCase()?.includes('t-shirt') ||
                               (product.tags && product.tags.some(tag => 
                                 tag.toLowerCase().includes('t-shirt')
                               )));
                               
          // Log the filtering results
          console.log(`Product ${product.name}: isMensProduct=${isMensProduct}, isShirt=${isShirt}, isNotTShirt=${isNotTShirt}`);
          
          return isMensProduct && isShirt && isNotTShirt;
        });
        
        console.log(`Found ${mensShirts.length} men's shirts after filtering`);
        setShirtsProducts(mensShirts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching shirts:', err);
        setError('Failed to load shirts. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchShirts();
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
    <Layout title="Men's Shirts">
      <div className="container" style={{ padding: '40px 0' }}>
        <h1>Men's Shirts</h1>

        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p>{error}</p>
          </div>
        ) : shirtsProducts.length === 0 ? (
          <div className={styles.emptyContainer}>
            <p>No shirts products found. Please check back later.</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {shirtsProducts.map(product => (
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