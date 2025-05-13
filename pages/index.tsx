import { useState, useEffect } from 'react';
import { FaHeart, FaTimes } from 'react-icons/fa';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product, products } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from '../styles/Home.module.css';

export default function Home() {
  // Filter featured products
  const featuredProducts = products.filter(product => product.featured);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<{ name: string; code: string } | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  
  useEffect(() => {
    // Reset selection when product changes
    if (quickViewProduct) {
      setSelectedSize(quickViewProduct.sizes[0]);
      setSelectedColor(quickViewProduct.colors ? quickViewProduct.colors[0] : undefined);
      setQuantity(1);
    }
  }, [quickViewProduct]);

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
  };
  
  const handleQuickViewAddToCart = () => {
    if (quickViewProduct && selectedSize) {
      addToCart(quickViewProduct, quantity, selectedSize, selectedColor);
      // Close the quick view after adding to cart
      closeQuickView();
    }
  };
  
  const increaseQuantity = () => {
    setQuantity(prev => Math.min(prev + 1, quickViewProduct?.stock || 10));
  };
  
  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <Layout>
      <Hero 
        heading="Elevate Your Style" 
        subheading="Discover our premium collection of jeans and shirts designed for the modern individual."
        backgroundImage="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=1080&q=80"
      />
      
      {/* Featured Products Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <p>Our most popular styles handpicked for you</p>
          </div>
          <div className={styles.productGrid}>
            {featuredProducts.map(product => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickView={handleQuickView}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* Banner Section */}
      <section className={styles.banner}>
        <div className="container">
          <div className={styles.bannerContainer}>
            <div className={styles.bannerItem}>
              <img 
                src="https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80" 
                alt="Men's Collection" 
              />
              <div className={styles.bannerContent}>
                <h2>Men's Collection</h2>
                <p>Explore our latest men's styles</p>
              </div>
            </div>
            <div className={styles.bannerItem}>
              <img 
                src="https://images.unsplash.com/photo-1565084888279-aca607ecce0c?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80" 
                alt="Denim Range" 
              />
              <div className={styles.bannerContent}>
                <h2>Premium Denim</h2>
                <p>Quality jeans for every occasion</p>
              </div>
            </div>
            <div className={styles.bannerItem}>
              <img 
                src="https://images.unsplash.com/photo-1495994458560-6f9d0652619b?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=800&q=80" 
                alt="Accessories" 
              />
              <div className={styles.bannerContent}>
                <h2>Accessories</h2>
                <p>Complete your look</p>
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
                  {quickViewProduct.discount && (
                    <span className="discount-badge">-{quickViewProduct.discount}%</span>
                  )}
                  {quickViewProduct.new && (
                    <span className="new-badge">New</span>
                  )}
                </div>
                <div className="thumbnail-container">
                  <div className="thumbnail active">
                    <img src={quickViewProduct.image} alt={quickViewProduct.name} />
                  </div>
                  {/* Additional thumbnails would go here */}
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
                
                {quickViewProduct.rating && (
                  <div className="product-rating">
                    <div className="stars">
                      {[...Array(5)].map((_, index) => (
                        <span key={index} className={index < Math.floor(quickViewProduct.rating || 0) ? "star filled" : "star"}>
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="rating-count">({quickViewProduct.reviews} reviews)</span>
                  </div>
                )}
                
                <div className="product-description">
                  <p>{quickViewProduct.description}</p>
                </div>
                
                <div className="product-status">
                  <span className={quickViewProduct.stock > 0 ? "in-stock" : "out-of-stock"}>
                    {quickViewProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                
                <div className="product-options">
                  {quickViewProduct.colors && quickViewProduct.colors.length > 0 && (
                    <div className="color-selection">
                      <h3>Select Color</h3>
                      <div className="color-options">
                        {quickViewProduct.colors.map(color => (
                          <button
                            key={color.code}
                            className={`color-option ${selectedColor?.code === color.code ? 'active' : ''}`}
                            style={{ backgroundColor: color.code }}
                            onClick={() => setSelectedColor(color)}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="size-selection">
                    <h3>Select Size</h3>
                    <div className="size-options">
                      {quickViewProduct.sizes.map(size => (
                        <label key={size} className={`size-option ${selectedSize === size ? 'active' : ''}`}>
                          <input 
                            type="radio" 
                            name="size" 
                            value={size} 
                            checked={selectedSize === size}
                            onChange={() => setSelectedSize(size)}
                          />
                          <span>{size}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div className="quantity-selection">
                    <h3>Quantity</h3>
                    <div className="quantity-wrapper">
                      <button 
                        className="quantity-btn minus" 
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                      >-</button>
                      <input 
                        type="number" 
                        min="1" 
                        max={quickViewProduct.stock} 
                        value={quantity}
                        onChange={(e) => setQuantity(Math.min(Math.max(1, parseInt(e.target.value) || 1), quickViewProduct.stock))}
                        className="quantity-input"
                      />
                      <button 
                        className="quantity-btn plus" 
                        onClick={increaseQuantity}
                        disabled={quantity >= quickViewProduct.stock}
                      >+</button>
                    </div>
                  </div>
                </div>
                
                <div className="product-actions">
                  <button 
                    className="add-to-cart-btn"
                    onClick={handleQuickViewAddToCart}
                    disabled={quickViewProduct.stock === 0}
                  >
                    {quickViewProduct.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                  </button>
                  <button 
                    className={`wishlist-btn ${isInWishlist(quickViewProduct.id) ? 'in-wishlist' : ''}`}
                    onClick={() => toggleWishlist(quickViewProduct)}
                  >
                    <FaHeart />
                    {isInWishlist(quickViewProduct.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  </button>
                </div>
                
                <div className="product-meta">
                  <p><strong>SKU:</strong> {quickViewProduct.id}</p>
                  <p><strong>Category:</strong> {quickViewProduct.category}</p>
                  {quickViewProduct.tags && (
                    <p><strong>Tags:</strong> {quickViewProduct.tags.join(', ')}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}