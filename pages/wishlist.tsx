import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaShoppingBag, FaTrashAlt, FaRegSadTear } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Product } from '../data/products';
import styles from '../styles/Wishlist.module.css';

const WishlistPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  // Optional: Redirect to login if not authenticated
  // Uncomment this if you want to make wishlist available only for logged in users
  // useEffect(() => {
  //   if (!isAuthenticated && !user) {
  //     router.push('/login?returnUrl=/wishlist');
  //   }
  // }, [isAuthenticated, user, router]);

  const handleRemoveFromWishlist = (product: Product) => {
    toggleWishlist(product);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    // Optionally remove from wishlist after adding to cart
    // toggleWishlist(product);
  };

  return (
    <Layout title="Wishlist - Nikhil's Jeans">
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>My Wishlist</h1>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> / Wishlist
          </div>
        </div>
      </div>

      <section className={styles.wishlistSection}>
        <div className="container">
          {wishlist.length > 0 ? (
            <div className={styles.wishlistContainer}>
              <div className={styles.wishlistHeader}>
                <h2>
                  <FaHeart /> My Wishlist ({wishlist.length} {wishlist.length === 1 ? 'item' : 'items'})
                </h2>
              </div>

              <div className={styles.wishlistGrid}>
                {wishlist.map((product) => (
                  <div key={product.id} className={styles.wishlistItem}>
                    <div className={styles.wishlistImageContainer}>
                      <Link href={`/product/${product.id}`}>
                        <div className={styles.wishlistImage}>
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      </Link>
                      <button
                        className={styles.removeButton}
                        onClick={() => handleRemoveFromWishlist(product)}
                        aria-label="Remove from wishlist"
                      >
                        <FaTrashAlt />
                      </button>
                    </div>

                    <div className={styles.wishlistItemContent}>
                      <div className={styles.itemCategory}>{product.category}</div>
                      <Link href={`/product/${product.id}`} className={styles.itemName}>
                        <h3>{product.name}</h3>
                      </Link>

                      {product.rating && (
                        <div className={styles.itemRating}>
                          {[...Array(5)].map((_, index) => (
                            <span key={index} className={index < Math.floor(product.rating || 0) ? styles.filledStar : styles.emptyStar}>
                              ★
                            </span>
                          ))}
                          <span className={styles.reviewCount}>({product.reviews})</span>
                        </div>
                      )}

                      <div className={styles.itemPrice}>
                        {product.originalPrice && (
                          <span className={styles.originalPrice}>₹{product.originalPrice}</span>
                        )}
                        <span className={styles.salePrice}>₹{product.price}</span>
                      </div>

                      <div className={styles.itemStatus}>
                        <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </div>

                      <div className={styles.itemActions}>
                        <button
                          className={styles.addToCartButton}
                          onClick={() => handleAddToCart(product)}
                          disabled={product.stock === 0}
                        >
                          <FaShoppingBag />
                          {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.emptyWishlistMessage}>
              <div className={styles.emptyWishlistIcon}>
                <FaRegSadTear />
              </div>
              <h3>Your wishlist is empty</h3>
              <p>You haven't added any items to your wishlist yet. Start shopping and save your favorite items!</p>
              <Link href="/products" className={styles.continueShoppingBtn}>
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default WishlistPage; 