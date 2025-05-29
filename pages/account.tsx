import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaUser, FaShoppingBag, FaHeart, FaMapMarkerAlt, FaKey, FaSignOutAlt } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import styles from '../styles/Account.module.css';

const AccountPage = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, wishlist } = useCart();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated && !user) {
      router.push('/login?returnUrl=/account');
    }
  }, [isAuthenticated, user, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  // Show loading or redirect if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Layout title="Account - Nikhil's Jeans">
        <div className="loading-container">
          <div className="loader"></div>
          <p>Please wait...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Account - Nikhil's Jeans">
      <div className={styles.pageHeader}>
        <div className="container">
          <h1>My Account</h1>
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link> / My Account
          </div>
        </div>
      </div>

      <section className={styles.accountSection}>
        <div className="container">
          <div className={styles.accountContainer}>
            {/* Sidebar */}
            <div className={styles.accountSidebar}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  <div className={styles.avatarPlaceholder}>
                    <FaUser />
                  </div>
                </div>
                <div className={styles.userDetails}>
                  <h3>{user.name}</h3>
                  <p>{user.email}</p>
                </div>
              </div>

              <nav className={styles.accountNav}>
                <Link href="/account" className={`${styles.accountNavLink} ${styles.active}`}>
                  <FaUser />
                  Dashboard
                </Link>
                <Link href="/orders" className={styles.accountNavLink}>
                  <FaShoppingBag />
                  Orders
                </Link>
                <Link href="/wishlist" className={styles.accountNavLink}>
                  <FaHeart />
                  Wishlist
                </Link>
                <Link href="/addresses" className={styles.accountNavLink}>
                  <FaMapMarkerAlt />
                  Addresses
                </Link>
                <Link href="/change-password" className={styles.accountNavLink}>
                  <FaKey />
                  Change Password
                </Link>
                {user.email === 'driger.ray.dranzer@gmail.com' && (
                  <Link href="/admin/orders" className={styles.accountNavLink} style={{ color: '#0a2472', fontWeight: 600 }}>
                    <FaUser />
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout} className={styles.accountNavLink}>
                  <FaSignOutAlt />
                  Logout
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className={styles.accountContent}>
              <div className={styles.welcomeSection}>
                <h2>Welcome back, {user.name}!</h2>
                <p>From your account dashboard you can view your recent orders, manage your shipping and billing addresses, and edit your password and account details.</p>
              </div>

              <div className={styles.accountGridContainer}>
                <div className={styles.accountGridItem}>
                  <div className={styles.gridItemHeader}>
                    <FaShoppingBag />
                    <h3>Orders</h3>
                  </div>
                  <div className={styles.gridItemContent}>
                    <p>You haven't placed any orders yet.</p>
                    <Link href="/products" className={styles.actionLink}>
                      Start Shopping
                    </Link>
                  </div>
                </div>

                <div className={styles.accountGridItem}>
                  <div className={styles.gridItemHeader}>
                    <FaHeart />
                    <h3>Wishlist</h3>
                  </div>
                  <div className={styles.gridItemContent}>
                    <p>You have {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'} in your wishlist.</p>
                    <Link href="/wishlist" className={styles.actionLink}>
                      View Wishlist
                    </Link>
                  </div>
                </div>

                <div className={styles.accountGridItem}>
                  <div className={styles.gridItemHeader}>
                    <FaShoppingBag />
                    <h3>Cart</h3>
                  </div>
                  <div className={styles.gridItemContent}>
                    <p>You have {cart.length} {cart.length === 1 ? 'item' : 'items'} in your shopping cart.</p>
                    <Link href="/cart" className={styles.actionLink}>
                      View Cart
                    </Link>
                  </div>
                </div>

                <div className={styles.accountGridItem}>
                  <div className={styles.gridItemHeader}>
                    <FaUser />
                    <h3>Account Details</h3>
                  </div>
                  <div className={styles.gridItemContent}>
                    <p>Update your personal information.</p>
                    <Link href="/account/edit" className={styles.actionLink}>
                      Edit Profile
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default AccountPage; 