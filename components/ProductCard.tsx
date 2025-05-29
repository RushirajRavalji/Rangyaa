import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaStar, FaRegStar, FaEye, FaShoppingCart } from 'react-icons/fa';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from '../styles/ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
  index?: number;
}

const ProductCard = ({ product, onAddToCart, onQuickView, index = 0 }: ProductCardProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [imageError, setImageError] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  // Check if we're on mobile on component mount
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    // Initial check
    if (typeof window !== 'undefined') {
      checkIfMobile();
      
      // Add event listener for window resize
      window.addEventListener('resize', checkIfMobile);
      
      // Cleanup
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      addToCart(product);
    }
  };
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Only handle clicks on mobile and only if not clicking on a link or button
    if (isMobile && !e.defaultPrevented && e.target instanceof HTMLElement) {
      const targetElement = e.target as HTMLElement;
      if (
        !targetElement.closest('a') && 
        !targetElement.closest('button') &&
        onQuickView
      ) {
        e.preventDefault();
        onQuickView(product);
      }
    }
  };

  // Format discount percentage
  const discountPercent = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;

  // Fallback image based on product category
  const getFallbackImage = () => {
    const category = product.category.toLowerCase();
    if (category.includes('jeans') || product.subcategory?.includes('jeans')) {
      return '/images/products/default-jeans.jpg';
    } else if (category.includes('shirt') || product.subcategory?.includes('shirt')) {
      return '/images/products/default-shirt.jpg';
    } else if (category.includes('t-shirt') || product.subcategory?.includes('t-shirt')) {
      return '/images/products/default-tshirt.jpg';
    } else if (category.includes('accessories') || product.subcategory?.includes('accessories')) {
      return '/images/products/default-accessory.jpg';
    }
    return '/images/products/default-product.jpg';
  };

  // Image source with fallback
  const imageSrc = imageError ? getFallbackImage() : product.image;

  // Calculate animation delay based on index
  const animationDelay = `${0.1 + (index % 8) * 0.1}s`;

  return (
    <div 
      className={`${styles.productCard} animate-on-scroll animate-hover`} 
      onClick={handleCardClick}
      style={{ animationDelay }}
    >
      <div className={styles.productImage}>
        <div className={`${styles.imageWrapper} img-hover-zoom`}>
          <Link href={`/product/${product.id}`}>
            <div className={styles.imageContainer}>
              <Image 
                src={imageSrc}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                style={{ objectFit: 'cover' }}
                onError={() => setImageError(true)}
                priority={product.featured}
              />
            </div>
          </Link>
          
          {discountPercent > 0 && (
            <span className={`${styles.discountBadge} scale-in`}>-{discountPercent}%</span>
          )}
          {product.new && (
            <span className={`${styles.newBadge} scale-in`}>New</span>
          )}
          {product.stock === 0 && (
            <span className={`${styles.outOfStockBadge} scale-in`}>Out of Stock</span>
          )}
        </div>
        
        <div className={styles.productActions}>
          <button 
            className={`${styles.actionButton} btn-animate`} 
            onClick={handleToggleWishlist}
            aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <span>{isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}</span>
          </button>
          
          <button 
            className={`${styles.actionButton} btn-animate`} 
            onClick={handleQuickView}
            aria-label="Quick view"
            title="Quick view"
          >
            <span><FaEye /></span>
          </button>
          
          <button 
            className={`${styles.actionButton} ${product.stock === 0 ? styles.disabled : ''} btn-animate`} 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            aria-label="Add to cart"
            title="Add to cart"
          >
            <span><FaShoppingCart /></span>
          </button>
        </div>
      </div>
      
      <div className={styles.productInfo}>
        <div className={styles.productCategory}>{product.category.toUpperCase()}</div>
        <Link href={`/product/${product.id}`} className={styles.productName}>
          <h3>{product.name}</h3>
        </Link>
        
        {product.rating !== undefined && (
          <div className={styles.productRating}>
            {[...Array(5)].map((_, index) => (
              <span key={index}>
                {index < Math.floor(product.rating || 0) ? (
                  <FaStar className={styles.filledStar} />
                ) : (
                  <FaRegStar className={styles.emptyStar} />
                )}
              </span>
            ))}
            <span className={styles.reviewCount}>({product.reviews || 0})</span>
          </div>
        )}
        
        <div className={styles.productPrice}>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
          )}
          <span className={styles.salePrice}>₹{product.price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 