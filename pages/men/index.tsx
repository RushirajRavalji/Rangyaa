import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import { useProducts } from '../../context/ProductContext';
import { FaSpinner } from 'react-icons/fa';
import styles from '../../styles/Products.module.css';
import Link from 'next/link';
import { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import QuickView from '../../components/QuickView';

export default function MenPage() {
  const { loading, error, products } = useProducts();
  const { addToCart } = useCart();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Filter for men's products (jeans, shirts, t-shirts and any future men's categories)
  const menProducts = products.filter(product => 
    ['jeans', 'shirts', 't-shirts', 'trousers', 'joggers'].includes(product.category)
  );

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
    <Layout title="Men's Collection">
      <Hero 
        page="men"
        heading="Men's Collection"
        subheading="Explore our latest styles for men"
        height="medium"
        backgroundImage="/images/hero-men.jpg"
        buttonText="Shop Now"
        buttonLink="#products"
      />

      <div className="container" style={{ padding: '40px 0' }} id="products">
        <div className={styles.categoriesNav}>
          <Link href="/men/jeans" className={styles.categoryLink}>Jeans</Link>
          <Link href="/men/shirts" className={styles.categoryLink}>Shirts</Link>
          <Link href="/men/t-shirts" className={styles.categoryLink}>T-Shirts</Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <FaSpinner style={{ animation: 'spin 1s linear infinite' }} size={30} />
            <p>Loading products...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '50px 0', color: '#721c24' }}>
            <p>{error}</p>
          </div>
        ) : menProducts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <p>No men's products found. Please check back later.</p>
          </div>
        ) : (
          <div className={styles.productsGrid}>
            {menProducts.map(product => (
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