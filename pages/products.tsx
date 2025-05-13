import { useState } from 'react';
import Link from 'next/link';
import { FaTimes, FaHeart } from 'react-icons/fa';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { Product, products } from '../data/products';
import styles from '../styles/Products.module.css';

export default function ProductsPage() {
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
    // In a real application, this would add the product to the cart
    // For now, just show a notification
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(`${product.name} added to cart`);
    }
  };

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: string) => {
    e.preventDefault();
    setSelectedCategory(category);
  };

  return (
    <Layout title="Products - Nikhil's Jeans">
      {/* Page Header */}
      <section className={styles.pageHeader} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80')" }}>
        <div className="container">
          <h1>Products</h1>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> / <span>Products</span>
          </div>
        </div>
      </section>

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
                
                <div className={styles.filterTitle}>Size</div>
                <ul className={`${styles.filterOptions} ${styles.sizeOptions}`}>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="size" 
                        value="s" 
                        checked={selectedSizes.includes('s')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, 's']);
                          } else {
                            setSelectedSizes(selectedSizes.filter(size => size !== 's'));
                          }
                        }}
                      />
                      S
                    </label>
                  </li>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="size" 
                        value="m" 
                        checked={selectedSizes.includes('m')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, 'm']);
                          } else {
                            setSelectedSizes(selectedSizes.filter(size => size !== 'm'));
                          }
                        }}
                      />
                      M
                    </label>
                  </li>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="size" 
                        value="l" 
                        checked={selectedSizes.includes('l')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, 'l']);
                          } else {
                            setSelectedSizes(selectedSizes.filter(size => size !== 'l'));
                          }
                        }}
                      />
                      L
                    </label>
                  </li>
                  <li>
                    <label>
                      <input 
                        type="checkbox" 
                        name="size" 
                        value="xl" 
                        checked={selectedSizes.includes('xl')}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedSizes([...selectedSizes, 'xl']);
                          } else {
                            setSelectedSizes(selectedSizes.filter(size => size !== 'xl'));
                          }
                        }}
                      />
                      XL
                    </label>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Right side: Products */}
            <div className={styles.productsGrid}>
              <div className={styles.productGridHeader}>
                <div className={styles.productsCount}>
                  <span>Showing 1-{sortedProducts.length} of {products.length} products</span>
                </div>
                <div className={styles.sortBy}>
                  <select 
                    name="sort-by" 
                    id="sort-by" 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
              
              <div className={styles.productGrid}>
                {sortedProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onQuickView={handleQuickView}
                    onAddToCart={handleAddToCart}
                  />
                ))}
              </div>
              
              {/* Pagination */}
              <div className={styles.pagination}>
                <a href="#" className={styles.active}>1</a>
                <a href="#">2</a>
                <a href="#">3</a>
                <a href="#" className={styles.next}>Next</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div className="quick-view-modal active">
          <div className="quick-view-container">
            <button className="close-quick-view" onClick={closeQuickView}>
              <FaTimes />
            </button>
            <div className="quick-view-content">
              <div className="quick-view-gallery">
                <div className="main-image">
                  <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                </div>
                <div className="thumbnail-container">
                  <div className="thumbnail active">
                    <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                  </div>
                </div>
              </div>
              <div className="quick-view-details">
                <h2>{quickViewProduct.name}</h2>
                <div className="product-price">
                  {quickViewProduct.originalPrice && (
                    <span className="original-price">₹{quickViewProduct.originalPrice}</span>
                  )}
                  <span className="sale-price">₹{quickViewProduct.price}</span>
                </div>
                <div className="product-description">
                  <p>{quickViewProduct.description}</p>
                </div>
                <div className="product-options">
                  <div className="size-selection">
                    <h3>Select Size</h3>
                    <div className="size-options">
                      {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <label key={size} className="size-option">
                          <input type="radio" name="size" value={size} />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => handleAddToCart(quickViewProduct)}
                  >
                    Add to Cart
                  </button>
                  <button className="wishlist-btn">
                    <FaHeart />
                    Add to Wishlist
                  </button>
                </div>
                <div className="product-meta">
                  <p><strong>Category:</strong> {quickViewProduct.category}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
} 