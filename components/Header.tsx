import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaSearch, FaUser, FaShoppingBag, FaGlobe, FaChevronRight, FaHeart, FaSignOutAlt, FaHome, FaTshirt, FaBoxOpen, FaTimes } from 'react-icons/fa';
import { navigation } from '../data/navigation';
import styles from '../styles/Header.module.css';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Search from './Search';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();
  
  const { getCartCount } = useCart();
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSubmenu = (label: string) => {
    if (activeSubmenu === label) {
      setActiveSubmenu('');
    } else {
      setActiveSubmenu(label);
    }
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [router.pathname]);

  // Toggle mobile menu and prevent body scroll when menu is open
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  };
  
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.headerContainer}>
            {/* Left side: Navigation categories */}
            <div className={styles.headerLeft}>
              <nav className={styles.navCategories}>
                {navigation.map((item) => (
                  <div key={item.label} className={item.dropdown ? styles.dropdown : ''}>
                    <Link 
                      href={item.href}
                      className={`${styles.navLink} ${
                        item.label === 'New Arrivals' ? styles.navNewArrivals : ''
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.dropdown && (
                      <div className={styles.dropdownContent}>
                        {item.dropdown.map((dropdownItem) => (
                          <Link key={dropdownItem.label} href={dropdownItem.href}>
                            {dropdownItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>
            
            {/* Center: Logo */}
            <Link href="/" className={styles.logo}>Nikhil&apos;s Jeans</Link>
            
            {/* Right side: Icons */}
            <div className={styles.headerRight}>
              <div className={styles.languageSelector}>
                <Link href="#" className={styles.navLink}>
                  <span className={styles.langIcon}>EN</span>
                </Link>
                <div className={styles.dropdownContent}>
                  <Link href="#">EN</Link>
                  <Link href="#">FR</Link>
                  <Link href="#">DE</Link>
                  <Link href="#">ES</Link>
                </div>
              </div>
              
              <button 
                className={`${styles.iconLink} ${styles.tapHighlight}`} 
                aria-label="Search"
                onClick={toggleSearch}
              >
                <FaSearch />
              </button>
              
              <div className={styles.userDropdown}>
                <Link href="/account" className={`${styles.iconLink} ${styles.tapHighlight}`} aria-label="Account">
                  <FaUser />
                </Link>
                <div className={styles.dropdownContent}>
                  {user ? (
                    <>
                      <div className={styles.userInfo}>
                        <p>Hello, {user.name}</p>
                      </div>
                      <Link href="/account">My Account</Link>
                      <Link href="/orders">My Orders</Link>
                      <Link href="/wishlist">My Wishlist</Link>
                      {user.email === 'driger.ray.dranzer@gmail.com' && (
                        <>
                          <Link href="/admin/orders" style={{ color: '#0a2472', fontWeight: 600 }}>Admin Panel</Link>
                        </>
                      )}
                      <button onClick={handleLogout} className={styles.logoutButton}>
                        <FaSignOutAlt /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login">Login</Link>
                      <Link href="/register">Register</Link>
                    </>
                  )}
                </div>
              </div>
              
              <Link href="/wishlist" className={`${styles.iconLink} ${styles.tapHighlight}`} aria-label="Wishlist">
                <FaHeart />
              </Link>
              
              <div className={styles.cartIcon}>
                <Link href="/cart" className={`${styles.iconLink} ${styles.tapHighlight}`} aria-label="Shopping Cart">
                  <FaShoppingBag />
                </Link>
                {getCartCount() > 0 && (
                  <span className={styles.cartCount}>{getCartCount()}</span>
                )}
              </div>
            </div>
            
            {/* Mobile header with symmetric layout */}
            <div className={styles.iconGroup}>
              {/* Left side icon(s) */}
              <div className={styles.cartIcon}>
                <Link href="/cart" className={`${styles.iconLink} ${styles.tapHighlight}`} aria-label="Shopping Cart">
                  <FaShoppingBag />
                </Link>
                {getCartCount() > 0 && (
                  <span className={styles.cartCount}>{getCartCount()}</span>
                )}
              </div>
            </div>
            
            {/* Mobile Navigation Menu Button - Right side */}
            <button 
              className={`${styles.hamburgerMenu} ${isMobileMenuOpen ? styles.active : ''} ${styles.tapHighlight}`} 
              aria-label="Menu"
              onClick={toggleMobileMenu}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Backdrop */}
      <div 
        className={`${styles.menuBackdrop} ${isMobileMenuOpen ? styles.active : ''}`} 
        onClick={toggleMobileMenu}
      ></div>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.active : ''}`}>
        <div className={styles.mobileMenuHeader}>
          <span>MENU</span>
          <button className={styles.closeButton} onClick={toggleMobileMenu}>
            <FaTimes />
          </button>
        </div>
        
        <div className={styles.mobileMenuSection}>
          <h3>CATEGORIES</h3>
          <nav className={styles.mobileNav}>
            <Link 
              href="/" 
              className={styles.navLink}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <FaHome />
              HOME
            </Link>
            
            {navigation.map((item, index) => (
              <div key={item.label}>
                {item.dropdown ? (
                  <>
                    <Link 
                      href="#"
                      className={`${styles.navLink} ${styles.hasSubmenu} ${activeSubmenu === item.label ? styles.open : ''}`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleSubmenu(item.label);
                      }}
                    >
                      <FaTshirt />
                      {item.label}
                      <FaChevronRight />
                    </Link>
                    <div className={`${styles.mobileSubmenu} ${activeSubmenu === item.label ? styles.active : ''}`}>
                      {item.dropdown.map((dropdownItem) => (
                        <Link 
                          key={dropdownItem.label} 
                          href={dropdownItem.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {dropdownItem.label}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <Link 
                    href={item.href}
                    className={styles.navLink}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <FaBoxOpen />
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Search Overlay */}
      {isSearchOpen && (
        <Search onClose={toggleSearch} />
      )}
    </>
  );
};

export default Header; 