import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaArrowRight } from 'react-icons/fa';
import styles from '../styles/Home.module.css';
import QuickView from '../components/QuickView';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import { Product } from '../data/products';

// Testimonials data
const testimonials = [
  {
    id: 1,
    text: "The quality of Nikhil's Jeans is exceptional. I've never found a better fitting pair of jeans anywhere else!",
    author: 'Rahul Sharma',
    location: 'Delhi',
    rating: 5
  },
  {
    id: 2,
    text: 'These jeans are incredibly comfortable and stylish. I get compliments every time I wear them!',
    author: 'Priya Patel',
    location: 'Mumbai',
    rating: 5
  },
  {
    id: 3,
    text: 'The customer service is as amazing as their products. I had questions about sizing and they were super helpful.',
    author: 'Vikram Singh',
    location: 'Bangalore',
    rating: 4
  }
];

// Featured categories
const featuredCategories = [
  {
    id: 1,
    title: "Men's Jeans",
    image: '/images/categories/mens-jeans.jpg',
    link: '/men/jeans'
  },
  {
    id: 2,
    title: "Women's Jeans",
    image: '/images/categories/womens-jeans.jpg',
    link: '/women/jeans'
  },
  {
    id: 3,
    title: 'Shirts & Tops',
    image: '/images/categories/shirts.jpg',
    link: '/clothing/tops'
  },
  {
    id: 4,
    title: 'Accessories',
    image: '/images/categories/accessories.jpg',
    link: '/accessories'
  }
];

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  const { addToCart } = useCart();

  // Fetch products from Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Initialize localStorage if we're in the browser
        if (typeof window !== 'undefined') {
          // Import localStorage API
          const localStorageAPI = await import('../utils/localStorage');
          localStorageAPI.initializeLocalStorage();
          
          console.log('LocalStorage initialized with fallback products');
        }
        
        // Import firestoreAPI to use Firebase functions
        const firestoreAPI = await import('../utils/firestore');
        
        // Clear cache first to ensure fresh data
        await firestoreAPI.clearProductCache();
        
        // Get featured products from Firebase
        const featured = await firestoreAPI.getFeaturedProducts(4);
        setFeaturedProducts(featured);
        
        // Get new arrivals from Firebase
        const newArrivals = await firestoreAPI.getNewArrivals(4);
        setNewArrivalsProducts(newArrivals);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again later.');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Testimonial auto-rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleQuickView = (product: Product) => {
    setQuickViewProduct(product);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification(`${product.name} added to cart`);
    }
  };

  // Add a retry function
  const handleRetryFetch = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Import firestoreAPI to use Firebase functions
      const firestoreAPI = await import('../utils/firestore');
      
      // Clear cache to ensure fresh data on retry
      await firestoreAPI.clearProductCache();
      
      // Try to get featured products from Firebase or localStorage fallback
      const featured = await firestoreAPI.getFeaturedProducts(4);
      setFeaturedProducts(featured);
      
      // Try to get new arrivals from Firebase or localStorage fallback
      const newArrivals = await firestoreAPI.getNewArrivals(4);
      setNewArrivalsProducts(newArrivals);
      
      // If we got products from either source, clear error
      if (featured.length > 0 || newArrivals.length > 0) {
        setError('');
      } else {
        setError('No products available. Please try adding products.');
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error retrying product fetch:', err);
      
      // Try one last time with localStorage directly
      try {
        const localStorageAPI = await import('../utils/localStorage');
        localStorageAPI.initializeLocalStorage(); // Make sure sample data is loaded
        
        const localFeatured = localStorageAPI.getFeaturedProducts(4);
        const localNewArrivals = localStorageAPI.getNewArrivals(4);
        
        setFeaturedProducts(localFeatured);
        setNewArrivalsProducts(localNewArrivals);
        
        if (localFeatured.length > 0 || localNewArrivals.length > 0) {
          setError(''); // Clear error if we got any products
        } else {
          setError('Unable to load products. Please try again later.');
        }
      } catch (localErr) {
        setError('Failed to load products. Please try again later.');
      }
      
      setLoading(false);
    }
  };
  
  return (
    <Layout title="Nikhil's Jeans - Premium Denim Wear">
      <Hero 
        page="home"
        heading="Elevate Your Style with Premium Denim" 
        subheading="Discover our new collection of high-quality jeans designed for comfort and durability"
        height="large"
        buttonText="Explore Collection"
        buttonLink="/products"
      />

      <section className={styles.featuredProducts}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>Featured Products</h2>
            <p>Handpicked selection of our finest denim products</p>
          </div>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button onClick={handleRetryFetch} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {featuredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                  onAddToCart={handleAddToCart}
                  index={index}
                />
              ))}
            </div>
          )}
          <div className={styles.viewAllContainer}>
            <Link href="/products" className={styles.viewAllButton}>
              View All Products
            </Link>
          </div>
        </div>
      </section>

      <section className={styles.promotionBanner}>
        <div className="container">
          <div className={styles.banner} style={{ backgroundImage: 'url(/images/banners/sale-banner.jpg)' }}>
            <div className={styles.bannerContent}>
              <h2 className={styles.bannerTitle}>Summer Sale</h2>
              <p className={styles.bannerSubtitle}>Up to 40% off on selected items</p>
              <Link href="/sale" className={styles.bannerButton}>
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.newArrivals}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>New Arrivals</h2>
            <p>Be the first to shop our latest designs</p>
          </div>
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
              <button onClick={handleRetryFetch} className={styles.retryButton}>
                Try Again
              </button>
            </div>
          ) : newArrivalsProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No products available at the moment.</p>
            </div>
          ) : (
            <div className={styles.productGrid}>
              {newArrivalsProducts.map((product, index) => (
                <ProductCard 
                  key={product.id}
                  product={product}
                  onQuickView={handleQuickView}
                  onAddToCart={handleAddToCart}
                  index={index}
                />
              ))}
            </div>
          )}
          <div className={styles.viewAllContainer}>
            <Link href="/new-arrivals" className={styles.viewAllButton}>
              View All New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonialsSection}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>What Our Customers Say</h2>
            <p>Read testimonials from our satisfied customers</p>
          </div>
          
          <div className={styles.testimonialCarousel}>
            <div className={styles.testimonialTrack} style={{ transform: `translateX(-${activeTestimonial * 100}%)` }}>
              {testimonials.map((testimonial) => (
                <div key={testimonial.id} className={styles.testimonialSlide}>
                  <div className={styles.testimonialCard}>
                    <div className={styles.testimonialRating}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </div>
                    <p className={styles.testimonialText}>{testimonial.text}</p>
                    <div className={styles.testimonialAuthor}>
                      <div className={styles.authorAvatar}>
                        {testimonial.author.charAt(0)}
                      </div>
                      <div className={styles.authorInfo}>
                        <p className={styles.authorName}>{testimonial.author}</p>
                        <p className={styles.authorLocation}>{testimonial.location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className={styles.testimonialControls}>
              <div className={styles.testimonialDots}>
                {testimonials.map((_, index) => (
                  <span 
                    key={index} 
                    className={`${styles.testimonialDot} ${index === activeTestimonial ? styles.active : ''}`}
                    onClick={() => setActiveTestimonial(index)}
                  ></span>
                ))}
              </div>
              
              <div className={styles.testimonialArrows}>
                <button 
                  className={styles.testimonialArrow} 
                  onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                  aria-label="Previous testimonial"
                >
                  &#10094;
                </button>
                <button 
                  className={styles.testimonialArrow} 
                  onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                  aria-label="Next testimonial"
                >
                  &#10095;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {quickViewProduct && (
        <QuickView 
          product={quickViewProduct} 
          onClose={() => setQuickViewProduct(null)} 
        />
      )}
    </Layout>
  );
}