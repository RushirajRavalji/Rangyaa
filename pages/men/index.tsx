import { useEffect, useState } from 'react';
import Layout from '../../components/Layout';
import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import { FaSpinner } from 'react-icons/fa';
import styles from '../../styles/Products.module.css';
import Link from 'next/link';
import { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import QuickView from '../../components/QuickView';
import * as firestoreAPI from '../../utils/firestore';

export default function MenPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [menProducts, setMenProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { addToCart } = useCart();
  
  // Fetch men's products from Firebase
  useEffect(() => {
    const fetchMensProducts = async () => {
      try {
        setLoading(true);
        
        // Get all products from Firebase
        const allProducts = await firestoreAPI.getAllProducts();
        console.log(`Fetched ${allProducts.length} total products, filtering for men's collection`);
        
        // Filter for men's products - improved filtering logic with more debug info
        const mensProducts = allProducts.filter(product => {
          console.log(`Processing product: ${product.id} - ${product.name} - Category: ${product.category} - Subcategory: ${product.subcategory || 'none'} - Tags: ${product.tags?.join(', ') || 'none'}`);
          
          // Check if primary category is men
          const isMensCategory = product.category?.toLowerCase() === 'men' || 
                                product.category?.toLowerCase() === 'mens';
          
          // Check if product has men's in the subcategory
          const hasMensSubcategory = product.subcategory?.toLowerCase()?.includes('men');
          
          // Check if product has men's in tags
          const hasMensTag = product.tags && product.tags.some(tag => 
            tag.toLowerCase() === 'men' || 
            tag.toLowerCase() === 'mens' ||
            tag.toLowerCase().startsWith('men-')
          );
          
          // Check for valid men's product types
          const validMensTypes = ['jeans', 'shirts', 't-shirts', 'trousers', 'joggers', 't-shirt', 'shirt'];
          const isValidType = product.subcategory && 
                             validMensTypes.some(type => product.subcategory?.toLowerCase()?.includes(type));
          
          // Product belongs to men's collection if it's directly in men's category
          // OR if it has men in subcategory AND is a valid men's product type
          // OR if it has a men's tag
          const shouldInclude = isMensCategory || (hasMensSubcategory && isValidType) || hasMensTag;
          
          console.log(`Product ${product.name}: isMensCategory=${isMensCategory}, hasMensSubcategory=${hasMensSubcategory}, hasMensTag=${hasMensTag}, isValidType=${isValidType}, shouldInclude=${shouldInclude}`);
          
          return shouldInclude;
        });
        
        console.log(`Found ${mensProducts.length} men's products after filtering`);
        setMenProducts(mensProducts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching men\'s products:', err);
        setError('Failed to load men\'s products. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchMensProducts();
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