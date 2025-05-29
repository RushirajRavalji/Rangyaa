import { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Layout from '../../components/Layout';
import Hero from '../../components/Hero';
import ProductCard from '../../components/ProductCard';
import ProductFilter from '../../components/ProductFilter';
import QuickView from '../../components/QuickView';
import { Product, getProductsByCategory, getProductsBySubcategory } from '../../data/products';
import { useCart } from '../../context/CartContext';
import styles from '../../styles/CategoryPage.module.css';

interface CategoryPageProps {
  products: Product[];
}

export default function JeansPage({ products }: CategoryPageProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { addToCart } = useCart();
  
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
            
            {filteredProducts.length === 0 ? (
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

export const getStaticProps: GetStaticProps = async () => {
  // Get all jeans products for men
  const products = getProductsBySubcategory('jeans').filter(product => product.category === 'men');
  
  return {
    props: {
      products,
    },
    revalidate: 60 * 60, // Revalidate every hour
  };
}; 