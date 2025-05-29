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

export default function SalePage() {
  const { loading, error, products } = useProducts();
  const { addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Find products with explicit discount >= 40%
  const explicitDiscountProducts = products.filter(product => 
    product.discount && product.discount >= 40
  );
  
  // Find products with implicit discount >= 40% (calculated from price difference)
  const implicitDiscountProducts = products.filter(product => 
    !product.discount && // Skip products with explicit discount
    product.originalPrice && 
    product.price && 
    ((product.originalPrice - product.price) / product.originalPrice * 100) >= 40
  );
  
  // Combine both lists for display
  const saleProducts = [...explicitDiscountProducts, ...implicitDiscountProducts];

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
    <Layout title="Sale">
      <Hero 
        page="sale"
        heading="Sale"
        subheading="Discover incredible savings with 40% or more off selected items!"
        height="medium"
        backgroundImage="/images/hero-sale.jpg"
        buttonText="Shop Now"
        buttonLink="#sale-products"
      />

      <div className="container" style={{ padding: '40px 0' }} id="sale-products">
        <div className={styles.saleInfo}>
          <h2>Special Offers</h2>
          <p>Discover incredible savings with 40% or more off selected items!</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
            <p>Loading sale items...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#721c24' }}>
            <p>{error}</p>
          </div>
        ) : saleProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No sale products found. Please check back later for upcoming offers.</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {saleProducts.map(product => (
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