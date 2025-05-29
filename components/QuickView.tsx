import { useState } from 'react';
import Image from 'next/image';
import { FaTimes, FaStar, FaRegStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { Product } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from '../styles/QuickView.module.css';

interface QuickViewProps {
  product: Product;
  onClose: () => void;
}

const QuickView = ({ product, onClose }: QuickViewProps) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  
  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart(product, quantity);
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification(`${product.name} added to cart`);
      }
      onClose();
    }
  };
  
  const handleQuantityChange = (value: number) => {
    const newQuantity = quantity + value;
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };
  
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Calculate discount percentage
  const discountPercent = product.originalPrice && product.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : product.discount || 0;
  
  return (
    <div className={styles.overlay} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        
        <div className={styles.content}>
          <div className={styles.imageSection}>
            <div className={styles.mainImage}>
              <Image 
                src={product.gallery ? product.gallery[selectedImage] : product.image} 
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
              />
              {discountPercent > 0 && (
                <span className={styles.discountBadge}>-{discountPercent}%</span>
              )}
              {product.new && (
                <span className={styles.newBadge}>New</span>
              )}
            </div>
            
            {product.gallery && product.gallery.length > 1 && (
              <div className={styles.thumbnails}>
                {product.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <Image 
                      src={image} 
                      alt={`${product.name} - Image ${index + 1}`}
                      width={60}
                      height={60}
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className={styles.details}>
            <h2>{product.name}</h2>
            
            <div className={styles.priceContainer}>
              <span className={styles.price}>₹{product.price.toLocaleString()}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
              )}
            </div>
            
            {product.rating !== undefined && (
              <div className={styles.rating}>
                {[...Array(5)].map((_, index) => (
                  <span key={index}>
                    {index < Math.floor(product.rating || 0) ? (
                      <FaStar className={styles.filledStar} />
                    ) : (
                      <FaRegStar className={styles.emptyStar} />
                    )}
                  </span>
                ))}
                <span className={styles.reviewCount}>({product.reviews || 0} Reviews)</span>
              </div>
            )}
            
            <div className={styles.description}>
              <p>{product.description}</p>
            </div>
            
            <div className={styles.stockStatus}>
              <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
              </span>
            </div>
            
            {product.sizes && product.sizes.length > 0 && (
              <div className={styles.sizeSelector}>
                <h3>Size</h3>
                <div className={styles.sizeOptions}>
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      className={`${styles.sizeOption} ${selectedSize === size ? styles.active : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {product.colors && product.colors.length > 0 && (
              <div className={styles.colorSelector}>
                <h3>Color</h3>
                <div className={styles.colorOptions}>
                  {product.colors.map(color => (
                    <button
                      key={color.name}
                      className={`${styles.colorOption} ${selectedColor === color.name ? styles.active : ''}`}
                      style={{ backgroundColor: color.code }}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}
            
            <div className={styles.quantitySelector}>
              <h3>Quantity</h3>
              <div className={styles.quantityControls}>
                <button 
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className={styles.actions}>
              <button 
                className={styles.addToCartButton}
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
              </button>
              
              <button 
                className={`${styles.wishlistButton} ${isInWishlist(product.id) ? styles.active : ''}`}
                onClick={() => toggleWishlist(product)}
                aria-label={isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
            
            <div className={styles.meta}>
              <p><strong>SKU:</strong> {product.sku || 'N/A'}</p>
              <p><strong>Category:</strong> {product.category}</p>
              {product.tags && (
                <p><strong>Tags:</strong> {product.tags.join(', ')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView; 