import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import ProductFilter from '../../components/ProductFilter';
import QuickView from '../../components/QuickView';
import { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import styles from '../../styles/CategoryPage.module.css';
import { FaSpinner } from 'react-icons/fa';
import * as firestoreAPI from '../../utils/firestore';

export default function JeansPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();
  
  // Fetch jeans products on client side
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get all products from Firebase
        const allProducts = await firestoreAPI.getAllProducts();
        console.log(`Fetched ${allProducts.length} total products, filtering for men's jeans`);
        
        // Filter for men's jeans using improved approach
        const mensJeans = allProducts.filter(product => {
          console.log(`Processing product: ${product.id} - ${product.name} - Category: ${product.category} - Subcategory: ${product.subcategory || 'none'} - Tags: ${product.tags?.join(', ') || 'none'}`);
          
          // Check if it's a men's product
          const isMensProduct = 
            product.category?.toLowerCase() === 'men' || 
            product.category?.toLowerCase() === 'mens' || 
            product.subcategory?.toLowerCase()?.includes('men') ||
            (product.tags && product.tags.some(tag => 
              tag.toLowerCase() === 'men' || 
              tag.toLowerCase() === 'mens' ||
              tag.toLowerCase().startsWith('men-')
            ));
          
          // Check if it's jeans
          const isJeans = 
            product.subcategory?.toLowerCase() === 'jeans' || 
            product.category?.toLowerCase() === 'jeans' ||
            (product.tags && product.tags.some(tag => 
              tag.toLowerCase() === 'jeans' ||
              tag.toLowerCase().includes('jeans')
            ));
          
          // Log the result of each check
          console.log(`Product ${product.name}: isMensProduct=${isMensProduct}, isJeans=${isJeans}`);
          
          // Must be either men's product AND jeans, OR have a combined tag like "men-jeans"
          const hasCombinedTag = product.tags && product.tags.some(tag => 
            tag.toLowerCase() === 'men-jeans' || 
            tag.toLowerCase() === 'mens-jeans'
          );
          
          return (isMensProduct && isJeans) || hasCombinedTag;
        });
        
        console.log(`Found ${mensJeans.length} men's jeans after filtering`);
        setProducts(mensJeans);
        setFilteredProducts(mensJeans);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching men\'s jeans:', err);
        setError('Failed to load men\'s jeans. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Debug products when they change
  useEffect(() => {
    console.log(`JeansPage has ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ${product.id}: ${product.name} - Category: ${product.category}, Subcategory: ${product.subcategory || 'none'}, Tags: ${product.tags?.join(', ') || 'none'}`);
    });
  }, [products]);
  
  // Extract unique sizes from products
  const allSizes = products
    .flatMap(product => product.sizes || [])
    .filter((size, index, self) => self.indexOf(size) === index)
    .sort();
  
  // Extract unique colors from products
  const allColors = products
    .flatMap(product => product.colors || [])
    .filter((color, index, self) => 
      self.findIndex(c => c.name === color.name) === index
    );
  
  // Prepare filter options
  const categoryOptions = [
    { label: 'Slim Fit', value: 'slim fit' },
    { label: 'Regular Fit', value: 'regular fit' },
    { label: 'Relaxed Fit', value: 'relaxed fit' },
    { label: 'Skinny Fit', value: 'skinny fit' },
    { label: 'Straight Fit', value: 'straight fit' },
    { label: 'Distressed', value: 'distressed' }
  ];
  
  const sizeOptions = allSizes.map(size => ({
    label: size,
    value: size
  }));
  
  const colorOptions = allColors.map(color => ({
    label: color.name,
    value: color.code
  }));
  
  const handleFilterChange = (filters: any) => {
    let result = [...products];
    
    // Filter by category/fit
    if (filters.category) {
      result = result.filter(product => 
        product.tags?.some(tag => tag.toLowerCase().includes(filters.category))
      );
    }
    
    // Filter by sizes
    if (filters.sizes.length > 0) {
      result = result.filter(product => 
        product.sizes?.some(size => filters.sizes.includes(size))
      );
    }
    
    // Filter by colors
    if (filters.colors.length > 0) {
      result = result.filter(product => 
        product.colors?.some(color => filters.colors.includes(color.code))
      );
    }
    
    // Filter by price range
    result = result.filter(product => 
      product.price >= filters.priceRange.min && 
      product.price <= filters.priceRange.max
    );
    
    // Sort products
    switch (filters.sort) {
      case 'newest':
        result = result.filter(product => product.new).concat(result.filter(product => !product.new));
        break;
      case 'price-low-high':
        result = result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high-low':
        result = result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result = result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default: // 'featured'
        result = result.filter(product => product.featured).concat(result.filter(product => !product.featured));
        break;
    }
    
    setFilteredProducts(result);
  };
  
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
  
  useEffect(() => {
    // Add overlay when filter is open on mobile
    if (isFilterOpen) {
      const overlay = document.createElement('div');
      overlay.className = styles.filterOverlay;
      overlay.addEventListener('click', () => setIsFilterOpen(false));
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.body.removeChild(overlay);
        document.body.style.overflow = '';
      };
    }
  }, [isFilterOpen]);
  
  return (
    <Layout 
      title="Men's Jeans | Nikhil's Jeans"
      description="Shop premium quality jeans for men. Wide range of fits and styles."
    >
      <Hero 
        page="men"
        heading="Men's Jeans"
        subheading="Premium denim crafted for comfort and style"
        height="small"
      />
      
      <div className="container">
        <div className={styles.categoryPage}>
          <aside className={styles.filterColumn}>
            <ProductFilter 
              categories={categoryOptions}
              sizes={sizeOptions}
              colors={colorOptions}
              onFilterChange={handleFilterChange}
              onMobileToggle={setIsFilterOpen}
            />
          </aside>
          
          <div className={styles.productsColumn}>
            <div className={styles.productsHeader}>
              <h2>Men's Jeans</h2>
              <p className={styles.productsCount}>{filteredProducts.length} products</p>
            </div>
            
            {loading ? (
              <div className={styles.loading}>
                <FaSpinner className={styles.spinner} />
                <p>{error || 'Loading products...'}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className={styles.noProducts}>
                <p>No products match your selected filters.</p>
                <button 
                  onClick={() => handleFilterChange({
                    category: '',
                    sizes: [],
                    colors: [],
                    priceRange: { min: 0, max: 10000 },
                    sort: 'featured'
                  })}
                  className={styles.resetButton}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className={styles.productsGrid}>
                {filteredProducts.map(product => (
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
        </div>
      </div>
      
      {/* QuickView Modal */}
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={closeQuickView} />
      )}
    </Layout>
  );
} 