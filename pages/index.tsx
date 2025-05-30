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

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Simulate API call with a timeout
        setTimeout(() => {
          // This would normally be an API call
          // Using dummy data for now
          const dummyFeatured: Product[] = [
            {
              id: '1',
              name: 'Classic Blue Jeans',
              price: 1999,
              description: 'Classic straight fit blue jeans with comfort stretch.',
              category: 'Men',
              image: '/images/products/jeans-1.jpg',
              gallery: ['/images/products/jeans-1.jpg', '/images/products/jeans-1-alt.jpg'],
              featured: true,
              new: false,
              stock: 25,
              rating: 4.5,
              reviews: 12,
              sizes: ['30', '32', '34', '36'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }],
              discount: 15,
              originalPrice: 1999
            },
            {
              id: '2',
              name: 'Slim Fit Black Jeans',
              price: 2299,
              description: 'Modern slim fit black jeans with premium denim.',
              category: 'Men',
              image: '/images/products/jeans-2.jpg',
              gallery: ['/images/products/jeans-2.jpg'],
              featured: true,
              new: true,
              stock: 18,
              rating: 4.7,
              reviews: 8,
              sizes: ['30', '32', '34', '36'],
              colors: [{ name: 'Black', code: '#000000' }]
            },
            {
              id: '3',
              name: 'High-Rise Skinny Jeans',
              price: 2499,
              description: 'High-rise skinny jeans with sculpting effect.',
              category: 'Women',
              image: '/images/products/jeans-3.jpg',
              gallery: ['/images/products/jeans-3.jpg'],
              featured: true,
              new: false,
              stock: 15,
              rating: 4.8,
              reviews: 16,
              sizes: ['26', '28', '30', '32'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }],
              discount: 20,
              originalPrice: 2499
            },
            {
              id: '4',
              name: 'Relaxed Fit Denim Jacket',
              price: 2799,
              description: 'Classic denim jacket with a relaxed fit.',
              category: 'Men',
              image: '/images/products/jacket-1.jpg',
              gallery: ['/images/products/jacket-1.jpg'],
              featured: true,
              new: true,
              stock: 10,
              rating: 4.6,
              reviews: 7,
              sizes: ['S', 'M', 'L', 'XL'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }]
            }
          ];

          const dummyNewArrivals: Product[] = [
            {
              id: '5',
              name: 'Distressed Boyfriend Jeans',
              price: 2599,
              description: 'Trendy distressed boyfriend jeans with a relaxed fit.',
              category: 'Women',
              image: '/images/products/jeans-4.jpg',
              gallery: ['/images/products/jeans-4.jpg'],
              featured: false,
              new: true,
              stock: 12,
              rating: 4.3,
              reviews: 5,
              sizes: ['26', '28', '30', '32'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }]
            },
            {
              id: '6',
              name: 'Bootcut Jeans',
              price: 2399,
              description: 'Classic bootcut jeans with a flattering silhouette.',
              category: 'Women',
              image: '/images/products/jeans-5.jpg',
              gallery: ['/images/products/jeans-5.jpg'],
              featured: false,
              new: true,
              stock: 8,
              rating: 4.5,
              reviews: 4,
              sizes: ['26', '28', '30', '32'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }],
              discount: 16,
              originalPrice: 2399
            },
            {
              id: '7',
              name: 'Denim Shirt',
              price: 1899,
              description: 'Versatile denim shirt perfect for casual outings.',
              category: 'Men',
              image: '/images/products/shirt-1.jpg',
              gallery: ['/images/products/shirt-1.jpg'],
              featured: false,
              new: true,
              stock: 20,
              rating: 4.4,
              reviews: 6,
              sizes: ['S', 'M', 'L', 'XL'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }]
            },
            {
              id: '8',
              name: 'Tapered Fit Jeans',
              price: 2199,
              description: 'Modern tapered fit jeans with stretch comfort.',
              category: 'Men',
              image: '/images/products/jeans-6.jpg',
              gallery: ['/images/products/jeans-6.jpg'],
              featured: false,
              new: true,
              stock: 15,
              rating: 4.6,
              reviews: 3,
              sizes: ['30', '32', '34', '36'],
              colors: [{ name: 'Blue', code: '#0a4b9f' }]
            }
          ];

          setFeaturedProducts(dummyFeatured);
          setNewArrivalsProducts(dummyNewArrivals);
          setLoading(false);
        }, 1500);
      } catch (err) {
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
    }, 5000);
    
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
          
          <div className={styles.testimonialContainer}>
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`${styles.testimonialCard} ${index === activeTestimonial ? styles.active : ''}`}
              >
                <div className={styles.testimonialContent}>
                  <div className={styles.testimonialRating}>
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < testimonial.rating ? styles.filledStar : styles.emptyStar}>★</span>
                    ))}
                  </div>
                  <p className={styles.testimonialText}>{testimonial.text}</p>
                  <div className={styles.testimonialAuthor}>
                    <div className={styles.authorAvatar}>
                      {testimonial.author.charAt(0)}
                    </div>
                    <div>
                      <p className={styles.authorName}>{testimonial.author}</p>
                      <p className={styles.authorLocation}>{testimonial.location}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            <div className={styles.testimonialDots}>
              {testimonials.map((_, index) => (
                <span 
                  key={index} 
                  className={`${styles.dot} ${index === activeTestimonial ? styles.activeDot : ''}`}
                  onClick={() => setActiveTestimonial(index)}
                ></span>
              ))}
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