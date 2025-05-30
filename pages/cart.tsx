import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FaShoppingBag, FaReceipt, FaMedal, FaShieldAlt, FaExchangeAlt, FaTruck, FaHeart, FaTrashAlt, FaTimes, FaUndo, FaCreditCard, FaRegSadTear } from 'react-icons/fa';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import { Product, products } from '../data/products';
import { useCart } from '../context/CartContext';
import styles from '../styles/Cart.module.css';

const CartPage = () => {
  const { cart, removeFromCart, updateCartItemQuantity, getCartTotal, toggleWishlist } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  
  // Get related products based on items in cart
  const getRelatedProducts = () => {
    if (cart.length === 0) return [];
    
    // Extract categories from cart items
    const cartCategories = cart.map(item => item.product.category);
    
    // Find products in the same categories but not in cart
    return products
      .filter(product => 
        cartCategories.includes(product.category) && 
        !cart.some(item => item.product.id === product.id)
      )
      .slice(0, 4);
  };
  
  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
  };
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateCartItemQuantity(productId, newQuantity);
  };
  
  const handleAddToWishlist = (productId: string) => {
    const product = cart.find(item => item.product.id === productId)?.product;
    if (product) {
      toggleWishlist(product);
      // Optionally remove from cart
      // removeFromCart(productId);
    }
  };
  
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      window.showNotification('Please enter a coupon code', 'warning');
      return;
    }
    
    setIsApplyingCoupon(true);
    
    // Simulate API call to validate coupon
    setTimeout(() => {
      // Demo coupons
      const validCoupons = [
        { code: 'SUMMER20', discount: 20 },
        { code: 'WELCOME10', discount: 10 },
        { code: 'JEANS15', discount: 15 }
      ];
      
      const foundCoupon = validCoupons.find(c => c.code === couponCode.toUpperCase());
      
      if (foundCoupon) {
        setAppliedCoupon(foundCoupon);
        window.showNotification(`Coupon applied! ${foundCoupon.discount}% discount`, 'success');
      } else {
        window.showNotification('Invalid coupon code', 'error');
      }
      
      setIsApplyingCoupon(false);
    }, 1000);
  };
  
  const calculateSubtotal = () => {
    return getCartTotal();
  };
  
  const calculateDiscount = () => {
    if (appliedCoupon) {
      return Math.round(calculateSubtotal() * (appliedCoupon.discount / 100));
    }
    return 0;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };
  
  // Calculate shipping for demo (free over 5000)
  const calculateShipping = () => {
    return calculateSubtotal() > 5000 ? 0 : 199;
  };
  
  const calculateTax = () => {
    return Math.round(calculateTotal() * 0.18); // 18% GST for demo
  };
  
  const calculateGrandTotal = () => {
    return calculateTotal() + calculateShipping() + calculateTax();
  };

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

  return (
    <Layout title="Shopping Cart - Nikhil's Jeans">
      {/* Page Header */}
      <section className={styles.pageHeader} style={{ backgroundImage: "url('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&h=400&q=80')" }}>
        <div className="container">
          <h1>Shopping Cart</h1>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> / <span>Cart</span>
          </div>
        </div>
      </section>

      {/* Cart Section */}
      <section className={`section ${styles.cartSection}`}>
        <div className="container">
          {cart.length > 0 ? (
            <div className={styles.modernCartContainer}>
              {/* Left Side - Cart Items */}
              <div className={styles.shoppingBag}>
                <div className={styles.shoppingBagHeader}>
                  <h2><FaShoppingBag /> Your Shopping Bag ({cart.length} {cart.length === 1 ? 'item' : 'items'})</h2>
                </div>

                {calculateShipping() === 0 ? (
                  <div className={styles.shippingNotification}>
                    Free shipping on your order!
                  </div>
                ) : (
                  <div className={styles.shippingNotification}>
                    Add ₹{5000 - calculateSubtotal()} more to get FREE shipping!
                  </div>
                )}

                {/* Cart Items */}
                {cart.map((item) => (
                  <div key={`${item.product.id}-${item.size}-${item.color?.code}`} className={styles.modernCartItem}>
                    <div className={styles.itemImage}>
                      <Image 
                        src={item.product.image} 
                        alt={item.product.name} 
                        width={120} 
                        height={150} 
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <div className={styles.itemDetails}>
                      <div className={styles.itemInfo}>
                        <h3>{item.product.name}</h3>
                        <div className={styles.itemCategory}>{item.product.category}</div>
                        <div className={styles.itemSize}>
                          <span>Size:</span>
                          {item.size}
                        </div>
                        {item.color && (
                          <div className={styles.itemColor}>
                            <span>Color:</span>
                            <div 
                              className={styles.colorSwatch} 
                              style={{ backgroundColor: item.color.code }}
                              title={item.color.name}
                            ></div>
                          </div>
                        )}
                        <div className={styles.itemQuantity}>
                          <span>Quantity:</span>
                          <div className={styles.quantityDropdown}>
                            <select 
                              value={item.quantity}
                              onChange={(e) => handleUpdateQuantity(item.product.id, parseInt(e.target.value))}
                            >
                              {[...Array(10)].map((_, index) => (
                                <option key={index + 1} value={index + 1}>
                                  {index + 1}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className={styles.itemPricing}>
                        <div className={styles.priceDetails}>
                          {item.product.originalPrice && (
                            <div className={styles.originalPrice}>
                              ₹{item.product.originalPrice * item.quantity}
                            </div>
                          )}
                          <div className={styles.discountedPrice}>
                            ₹{item.product.price * item.quantity}
                          </div>
                          {item.product.originalPrice && (
                            <div className={styles.discountPercentage}>
                              Save {Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}%
                            </div>
                          )}
                        </div>
                        <div className={styles.itemActions}>
                          <button 
                            className={styles.wishlistAction}
                            onClick={() => handleAddToWishlist(item.product.id)}
                          >
                            <FaHeart />
                            Save for Later
                          </button>
                          <button 
                            className={styles.removeAction}
                            onClick={() => handleRemoveItem(item.product.id)}
                          >
                            <FaTrashAlt />
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Side - Order Summary */}
              <div className={styles.orderSummaryContainer}>
                <div className={styles.orderSummary}>
                  <div className={styles.summaryHeader}>
                    <h2><FaReceipt /> Order Summary</h2>
                  </div>
                  <div className={styles.summaryDetails}>
                    <div className={styles.summaryRow}>
                      <span>Subtotal</span>
                      <span>₹{calculateSubtotal()}</span>
                    </div>
                    
                    {appliedCoupon && (
                      <div className={`${styles.summaryRow} ${styles.discount}`}>
                        <span>Discount ({appliedCoupon.code})</span>
                        <span className={styles.discountValue}>-₹{calculateDiscount()}</span>
                      </div>
                    )}
                    
                    <div className={styles.summaryRow}>
                      <span>Shipping</span>
                      <span>{calculateShipping() === 0 ? 'FREE' : `₹${calculateShipping()}`}</span>
                    </div>
                    
                    <div className={styles.summaryRow}>
                      <span>Tax (18% GST)</span>
                      <span>₹{calculateTax()}</span>
                    </div>
                    
                    <div className={`${styles.summaryRow} ${styles.total}`}>
                      <span>Total</span>
                      <span>₹{calculateGrandTotal()}</span>
                    </div>
                    
                    <div className={`${styles.summaryRow} ${styles.taxNote}`}>
                      <span>Including ₹{calculateTax()} in taxes</span>
                    </div>
                  </div>
                  
                  <div className={styles.couponSection}>
                    <div className={styles.couponForm}>
                      <input 
                        type="text" 
                        placeholder="Enter coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        className={styles.couponInput}
                      />
                      <button 
                        className={styles.applyCouponBtn}
                        onClick={handleApplyCoupon}
                        disabled={isApplyingCoupon}
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    <div className={styles.validCoupons}>
                      <p>Try: SUMMER20, WELCOME10, JEANS15</p>
                    </div>
                  </div>
                  
                  <Link href="/checkout" className={styles.checkoutBtn}>
                    <FaCreditCard style={{ marginRight: '10px' }} />
                    Proceed to Checkout
                  </Link>
                </div>
                
                <div className={styles.shoppingBenefits}>
                  <div className={styles.benefit}>
                    <FaShieldAlt />
                    <div className={styles.benefitText}>
                      <p>Secure Payments</p>
                    </div>
                  </div>
                  <div className={styles.benefit}>
                    <FaTruck />
                    <div className={styles.benefitText}>
                      <p>Fast Delivery</p>
                    </div>
                  </div>
                  <div className={styles.benefit}>
                    <FaUndo />
                    <div className={styles.benefitText}>
                      <p>Easy Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={`${styles.emptyCartMessage} emptyCartMessage`}>
              <div className={`${styles.emptyCartIcon} emptyCartIcon`}>
                <FaRegSadTear />
              </div>
              <h3>Your shopping bag is empty</h3>
              <p>Looks like you haven't added anything to your bag yet. Start shopping to fill it with awesome products!</p>
              <Link href="/products" className={`${styles.continueShoppingBtn} continueShoppingBtn`}>
                Continue Shopping
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {cart.length > 0 && getRelatedProducts().length > 0 && (
        <section className={`section ${styles.relatedProducts}`}>
          <div className="container">
            <div className="section-header">
              <h2>You May Also Like</h2>
              <p>Based on your shopping bag</p>
            </div>
            <div className={styles.productGrid}>
              {getRelatedProducts().map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                />
              ))}
            </div>
          </div>
        </section>
      )}

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
};

export default CartPage; 