import Link from 'next/link';
import { useState, useEffect } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';
import { footerLinks } from '../data/navigation';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');
  const [activeCollapse, setActiveCollapse] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple email validation
    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address');
      return;
    }
    
    // Simulate subscription success
    setSubscribed(true);
    setError('');
    setEmail('');
    
    // Reset success message after 5 seconds
    setTimeout(() => {
      setSubscribed(false);
    }, 5000);
  };

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

  // Toggle footer section collapse on mobile
  const toggleCollapse = (title: string) => {
    if (activeCollapse === title) {
      setActiveCollapse(null);
    } else {
      setActiveCollapse(title);
    }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div className={styles.footerGrid}>
            {/* Company Info */}
            <div className={styles.footerCol}>
              <h3 
                className={`${styles.footerTitle} ${activeCollapse === 'company' ? styles.active : ''}`}
                onClick={() => isMobile && toggleCollapse('company')}
              >
                Nikhil's Jeans
              </h3>
              <div className={`${isMobile ? styles.collapseContent : ''} ${activeCollapse === 'company' ? styles.active : ''}`}>
                <p className={styles.footerDesc}>
                  Premium denim and apparel for the modern individual. Quality craftsmanship with attention to detail.
                </p>
                <div className={styles.footerContact}>
                  <p className={styles.contactItem}>
                    <FaMapMarkerAlt />
                    123 Fashion Street, Mumbai, India
                  </p>
                  <p className={styles.contactItem}>
                    <FaPhoneAlt />
                    +91 98765 43210
                  </p>
                  <p className={styles.contactItem}>
                    <FaEnvelope />
                    info@nikhilsjeans.com
                  </p>
                </div>
                <div className={styles.socialIcons}>
                  <a href="#" className={styles.socialIcon} aria-label="Facebook">
                    <FaFacebookF />
                  </a>
                  <a href="#" className={styles.socialIcon} aria-label="Twitter">
                    <FaTwitter />
                  </a>
                  <a href="#" className={styles.socialIcon} aria-label="Instagram">
                    <FaInstagram />
                  </a>
                  <a href="#" className={styles.socialIcon} aria-label="Pinterest">
                    <FaPinterestP />
                  </a>
                  <a href="#" className={styles.socialIcon} aria-label="YouTube">
                    <FaYoutube />
                  </a>
                </div>
              </div>
            </div>
            
            {/* Company */}
            <div className={styles.footerCol}>
              <h3 
                className={`${styles.footerTitle} ${activeCollapse === 'about' ? styles.active : ''}`}
                onClick={() => isMobile && toggleCollapse('about')}
              >
                Company
              </h3>
              <div className={`${isMobile ? styles.collapseContent : ''} ${activeCollapse === 'about' ? styles.active : ''}`}>
                <nav className={styles.footerNav}>
                  <Link href="/about-us" className={styles.footerLink}>About Us</Link>
                  <Link href="/contact-us" className={styles.footerLink}>Contact Us</Link>
                  <Link href="/careers" className={styles.footerLink}>Careers</Link>
                  <Link href="/our-stores" className={styles.footerLink}>Our Stores</Link>
                  <Link href="/blog" className={styles.footerLink}>Blog</Link>
                </nav>
              </div>
            </div>
            
            {/* Customer Service */}
            <div className={styles.footerCol}>
              <h3 
                className={`${styles.footerTitle} ${activeCollapse === 'service' ? styles.active : ''}`}
                onClick={() => isMobile && toggleCollapse('service')}
              >
                Customer Service
              </h3>
              <div className={`${isMobile ? styles.collapseContent : ''} ${activeCollapse === 'service' ? styles.active : ''}`}>
                <nav className={styles.footerNav}>
                  <Link href="/faq" className={styles.footerLink}>FAQ</Link>
                  <Link href="/shipping-returns" className={styles.footerLink}>Shipping & Returns</Link>
                  <Link href="/size-guide" className={styles.footerLink}>Size Guide</Link>
                  <Link href="/track-order" className={styles.footerLink}>Track Order</Link>
                  <Link href="/gift-cards" className={styles.footerLink}>Gift Cards</Link>
                </nav>
              </div>
            </div>
            
            {/* Categories */}
            <div className={styles.footerCol}>
              <h3 
                className={`${styles.footerTitle} ${activeCollapse === 'categories' ? styles.active : ''}`}
                onClick={() => isMobile && toggleCollapse('categories')}
              >
                Categories
              </h3>
              <div className={`${isMobile ? styles.collapseContent : ''} ${activeCollapse === 'categories' ? styles.active : ''}`}>
                <nav className={styles.footerNav}>
                  <Link href="/men/jeans" className={styles.footerLink}>Men's Jeans</Link>
                  <Link href="/men/shirts" className={styles.footerLink}>Shirts</Link>
                  <Link href="/men/t-shirts" className={styles.footerLink}>T-Shirts</Link>
                  <Link href="/accessories" className={styles.footerLink}>Accessories</Link>
                  <Link href="/sale" className={styles.footerLink}>Sale</Link>
                </nav>
              </div>
            </div>
            
            {/* Newsletter */}
            <div className={styles.footerCol}>
              <h3 
                className={`${styles.footerTitle} ${activeCollapse === 'newsletter' ? styles.active : ''}`}
                onClick={() => isMobile && toggleCollapse('newsletter')}
              >
                Stay Updated
              </h3>
              <div className={`${isMobile ? styles.collapseContent : ''} ${activeCollapse === 'newsletter' ? styles.active : ''}`}>
                <p className={styles.newsletterText}>
                  Subscribe to receive updates on new arrivals and special promotions.
                </p>
                <form onSubmit={handleSubscribe} className={styles.subscribeForm}>
                  <div className={styles.formGroup}>
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={error ? styles.errorInput : ''}
                    />
                    <button type="submit">Subscribe</button>
                  </div>
                  {error && <p className={styles.errorMessage}>{error}</p>}
                  {subscribed && <p className={styles.successMessage}>Thank you for subscribing!</p>}
                </form>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            © {currentYear} Nikhil's Jeans. All rights reserved.
          </div>
          <div className={styles.policies}>
            <Link href="/privacy-policy" className={styles.policyLink}>Privacy Policy</Link>
            <Link href="/terms-of-service" className={styles.policyLink}>Terms of Service</Link>
          </div>
          <div className={styles.paymentMethods}>
            <img 
              src="/images/payment-methods.png" 
              alt="Payment Methods" 
              className={styles.paymentMethod}
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 