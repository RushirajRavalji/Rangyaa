import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from '../styles/ProductCard.module.css';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onQuickView?: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart, onQuickView }: ProductCardProps) => {
  const [isMobile, setIsMobile] = useState(false);
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

  return (
    <div className={styles.productCard} onClick={handleCardClick}>
      <div className={styles.productImage}>
        <div className={styles.imageWrapper}>
          <Image 
            src={product.image} 
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            style={{ objectFit: 'cover' }}
          />
          {product.discount && (
            <span className={styles.discountBadge}>-{product.discount}%</span>
          )}
          {product.new && (
            <span className={styles.newBadge}>New</span>
          )}
        </div>
        <div className={`${styles.productOverlay} ${isMobile ? styles.mobileOverlay : ''}`}>
          <button 
            className={styles.wishlistButton} 
            onClick={handleToggleWishlist}
            aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
          </button>
          <button className={styles.quickViewBtn} onClick={handleQuickView}>Quick View</button>
          <button 
            className={styles.addToCart} 
            onClick={handleAddToCart}
            disabled={product.stock === 0}
          >
            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
      <div className={styles.productInfo}>
        <div className={styles.productCategory}>{product.category}</div>
        <Link href={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        {product.rating && (
          <div className={styles.productRating}>
            {[...Array(5)].map((_, index) => (
              <span key={index} className={index < Math.floor(product.rating || 0) ? styles.filledStar : styles.emptyStar}>
                ★
              </span>
            ))}
            <span className={styles.reviewCount}>({product.reviews})</span>
          </div>
        )}
        <div className={styles.productPrice}>
          {product.originalPrice && (
            <span className={styles.originalPrice}>₹{product.originalPrice}</span>
          )}
          <span className={styles.salePrice}>₹{product.price}</span>
        </div>
      </div>
    </div>
  );
};

export default ProductCard; 