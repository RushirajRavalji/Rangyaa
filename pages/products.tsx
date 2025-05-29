import { useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaHeart } from 'react-icons/fa';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product } from '../data/products';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import styles from '../styles/Products.module.css';
import QuickView from '../components/QuickView';

export default function ProductsPage() {
  const { products, loading, error } = useProducts();
  const { addToCart } = useCart();
  const [sortBy, setSortBy] = useState('featured');
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter products based on selected filters
  const filteredProducts = products.filter(product => {
    // Filter by category
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }
    
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    } else if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    return 0;
  });

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
    document.body.style.overflow = 'hidden';
  };

  const closeQuickView = () => {
    setQuickViewProduct(null);
    document.body.style.overflow = '';
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(`${product.name} added to cart`);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    setSelectedCategory(category);
  };

  return (
    <Layout title="Products - Rangya">
      {/* Page Header */}
      <Hero 
        page="products"
        heading="Our Products" 
        subheading="Explore our collection of premium clothing"
        backgroundImage="https://via.placeholder.com/1920x400?text=Products+Banner"
      />

      {/* Products Section */}
      <section className={`section ${styles.productsSection}`}>
        <div className="container">
          <div className={styles.productsContainer}>
            {/* Left side: Filters */}
            <div className={styles.filterSidebar}>
              <div className={styles.filterGroup}>
                <h3>Categories</h3>
                <ul className={styles.filterOptions}>
                  <li>
                    <a 
                      href="#" 
                      className={selectedCategory === 'all' ? styles.active : ''} 
                      onClick={(e) => handleCategoryClick(e, 'all')}
                    >
                      All Products
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className={selectedCategory === 'jeans' ? styles.active : ''} 
                      onClick={(e) => handleCategoryClick(e, 'jeans')}
                    >
                      Jeans
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className={selectedCategory === 'shirts' ? styles.active : ''} 
                      onClick={(e) => handleCategoryClick(e, 'shirts')}
                    >
                      Shirts
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#" 
                      className={selectedCategory === 't-shirts' ? styles.active : ''} 
                      onClick={(e) => handleCategoryClick(e, 't-shirts')}
                    >
                      T-Shirts
                    </a>
                  </li>
                </ul>
              </div>
              
              <div className={styles.filterGroup}>
                <h3>Filter by</h3>
                <div className={styles.filterTitle}>Price</div>
                <ul className={styles.filterOptions}>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="price-range" 
                        value="0-3000" 
                        checked={selectedPriceRanges.includes('0-3000')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriceRanges([...selectedPriceRanges, '0-3000']);
                          } else {
                            setSelectedPriceRanges(selectedPriceRanges.filter(range => range !== '0-3000'));
                          }
                        }}
                      />
                      ₹0 - ₹3,000
                    </label>
                  </li>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="price-range" 
                        value="3000-5000" 
                        checked={selectedPriceRanges.includes('3000-5000')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriceRanges([...selectedPriceRanges, '3000-5000']);
                          } else {
                            setSelectedPriceRanges(selectedPriceRanges.filter(range => range !== '3000-5000'));
                          }
                        }}
                      />
                      ₹3,000 - ₹5,000
                    </label>
                  </li>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="price-range" 
                        value="5000-7000" 
                        checked={selectedPriceRanges.includes('5000-7000')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriceRanges([...selectedPriceRanges, '5000-7000']);
                          } else {
                            setSelectedPriceRanges(selectedPriceRanges.filter(range => range !== '5000-7000'));
                          }
                        }}
                      />
                      ₹5,000 - ₹7,000
                    </label>
                  </li>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="price-range" 
                        value="7000+" 
                        checked={selectedPriceRanges.includes('7000+')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedPriceRanges([...selectedPriceRanges, '7000+']);
                          } else {
                            setSelectedPriceRanges(selectedPriceRanges.filter(range => range !== '7000+'));
                          }
                        }}
                      />
                      ₹7,000+
                    </label>
                  </li>
                </ul>
              </div>

              <div className={styles.filterGroup}>
                <div className={styles.filterTitle}>Size</div>
                <ul className={styles.filterOptions}>
                  {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                    <li key={size}>
                      <label>
                        <input 
                          type="checkbox" 
                          name="size" 
                          value={size}
                          checked={selectedSizes.includes(size)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedSizes([...selectedSizes, size]);
                            } else {
                              setSelectedSizes(selectedSizes.filter(s => s !== size));
                            }
                          }}
                        />
                        {size}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right side: Products */}
            <div className={styles.productsGrid}>
              <div className={styles.productsHeader}>
                <div className={styles.resultsCount}>
                  {sortedProducts.length} Products Found
                </div>
                <div className={styles.sortOptions}>
                  <label htmlFor="sort-by">Sort by:</label>
                  <select 
                    id="sort-by" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className={styles.loadingState}>Loading products...</div>
              ) : error ? (
                <div className={styles.errorState}>{error}</div>
              ) : sortedProducts.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No products match your selected filters.</p>
                  <button 
                    className={styles.resetButton}
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedPriceRanges([]);
                      setSelectedSizes([]);
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className={styles.productsGridLayout}>
                  {sortedProducts.map(product => (
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
      </section>

      {/* QuickView Modal */}
      {quickViewProduct && (
        <QuickView product={quickViewProduct} onClose={closeQuickView} />
      )}
    </Layout>
  );
} 