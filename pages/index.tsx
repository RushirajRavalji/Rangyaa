import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaSpinner, FaQuoteLeft, FaArrowRight } from 'react-icons/fa';
import Layout from '../components/Layout';
import Hero from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';
import styles from '../styles/Home.module.css';
import QuickView from '../components/QuickView';

// Testimonials data
const testimonials = [
  {
    id: 1,
    name: 'Rahul Sharma',
    role: 'Verified Customer',
    image: '/images/testimonials/testimonial-1.jpg',
    quote: 'The quality of these jeans is exceptional. They fit perfectly and the material is very comfortable. Definitely worth the price!',
    rating: 5
  },
  {
    id: 2,
    name: 'Priya Patel',
    role: 'Verified Customer',
    image: '/images/testimonials/testimonial-2.jpg',
    quote: 'I love the slim fit jeans I purchased. The delivery was quick and the customer service was excellent. Will shop again!',
    rating: 5
  },
  {
    id: 3,
    name: 'Amit Singh',
    role: 'Verified Customer',
    image: '/images/testimonials/testimonial-3.jpg',
    quote: 'The shirts are stylish and comfortable. I\'ve received many compliments. The size guide was very helpful for getting the perfect fit.',
    rating: 4
  }
];

// Featured categories
const featuredCategories = [
  {
    id: 'mens-jeans',
    title: 'Men\'s Jeans',
    image: '/images/categories/mens-jeans.jpg',
    link: '/men/jeans'
  },
  {
    id: 'shirts',
    title: 'Shirts',
    image: '/images/categories/shirts.jpg',
    link: '/men/shirts'
  },
  {
    id: 'tshirts',
    title: 'T-Shirts',
    image: '/images/categories/tshirts.jpg',
    link: '/men/t-shirts'
  },
  {
    id: 'accessories',
    title: 'Accessories',
    image: '/images/categories/accessories.jpg',
    link: '/accessories'
  }
];

export default function Home() {
  const { products, loading, error } = useProducts();
  
  // Filter products
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivalsProducts, setNewArrivalsProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  const { addToCart } = useCart();
  
  useEffect(() => {
    // Filter featured products when products are loaded
    if (products && products.length > 0) {
      setFeaturedProducts(products.filter(product => product.featured).slice(0, 8));
      
      // Get new arrivals (8 most recent products)
      const newProducts = products.filter(product => product.new).slice(0, 8);
      setNewArrivalsProducts(newProducts);
    }
  }, [products]);

  useEffect(() => {
    // Rotate testimonials every 5 seconds
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    
    return () => clearInterval(interval);
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
    <Layout>
      <Hero 
        page="home"
        heading="Redefine Your Wardrobe" 
        subheading="Experience premium craftsmanship with our curated collection of denim and apparel for the modern trendsetter."
        height="large"
        buttonText="Explore Collection"
        buttonLink="/men"
      />
      
      {/* Featured Categories Section */}
      <section className={styles.categoriesSection}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>Shop by Category</h2>
            <p>Explore our collections</p>
          </div>
          
          <div className={styles.categoriesGrid}>
            {featuredCategories.map(category => (
              <Link href={category.link} key={category.id} className={styles.categoryCard}>
                <div className={styles.categoryImage}>
                  <Image 
                    src={category.image} 
                    alt={category.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <div className={styles.categoryContent}>
                  <h3>{category.title}</h3>
                  <span className={styles.categoryLink}>
                    Shop Now <FaArrowRight />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>Featured Products</h2>
            <p>Our most popular styles handpicked for you</p>
          </div>
          
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No featured products available at the moment. Please check back later.</p>
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
      
      {/* Banner Section */}
      <section className={styles.bannerSection}>
        <div className="container">
          <div className={styles.banner}>
            <div className={styles.bannerContent}>
              <h2>Summer Sale</h2>
              <p>Up to 40% off on selected items</p>
              <Link href="/sale" className={styles.bannerButton}>
                Shop the Sale
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* New Arrivals Section */}
      <section className={styles.productsSection}>
        <div className="container">
          <div className={styles.sectionTitle}>
            <h2>New Arrivals</h2>
            <p>The latest additions to our collection</p>
          </div>
          
          {loading ? (
            <div className={styles.loadingContainer}>
              <FaSpinner className={styles.spinner} />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <p>{error}</p>
            </div>
          ) : newArrivalsProducts.length === 0 ? (
            <div className={styles.emptyContainer}>
              <p>No new arrivals available at the moment. Please check back later.</p>
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
            <p>Real experiences from satisfied customers</p>
          </div>
          
          <div className={styles.testimonialSlider}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id} 
                className={`${styles.testimonialItem} ${index === activeTestimonial ? styles.active : ''}`}
              >
                <div className={styles.testimonialQuote}>
                  <FaQuoteLeft className={styles.quoteIcon} />
                  <p>{testimonial.quote}</p>
                </div>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.authorImage}>
                    <Image 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      width={60}
                      height={60}
                    />
                  </div>
                  <div className={styles.authorInfo}>
                    <h4>{testimonial.name}</h4>
                    <p>{testimonial.role}</p>
                    <div className={styles.testimonialRating}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < testimonial.rating ? styles.starFilled : styles.starEmpty}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={styles.testimonialDots}>
            {testimonials.map((_, index) => (
              <button 
                key={index} 
                className={`${styles.testimonialDot} ${index === activeTestimonial ? styles.active : ''}`}
                onClick={() => setActiveTestimonial(index)}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
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