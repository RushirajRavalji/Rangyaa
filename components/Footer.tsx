import Link from 'next/link';
import { useState } from 'react';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';
import { footerLinks } from '../data/navigation';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

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

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerTop}>
          <div className={styles.footerColumn}>
            <h3>Nikhil's Jeans</h3>
            <p className={styles.footerAbout}>
              Premium denim and apparel for the modern individual. Quality craftsmanship with attention to detail.
            </p>
            <div className={styles.footerSocial}>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <FaFacebookF />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <FaInstagram />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest">
                <FaPinterestP />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <FaYoutube />
              </a>
            </div>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Company</h3>
            <ul className={styles.footerLinks}>
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Categories</h3>
            <ul className={styles.footerLinks}>
              {footerLinks.categories.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Customer Service</h3>
            <ul className={styles.footerLinks}>
              {footerLinks.customerService.map((link, index) => (
                <li key={index}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          
          <div className={`${styles.footerColumn} ${styles.newsletterColumn}`}>
            <h3>Stay Updated</h3>
            <p>Subscribe to receive updates on new arrivals and special promotions.</p>
            
            <form onSubmit={handleSubscribe} className={styles.newsletterForm}>
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
            
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <FaMapMarkerAlt />
                <span>123 Fashion Street, Mumbai, India</span>
              </div>
              <div className={styles.contactItem}>
                <FaPhoneAlt />
                <span>+91 98765 43210</span>
              </div>
              <div className={styles.contactItem}>
                <FaEnvelope />
                <span>info@nikhilsjeans.com</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <div className={styles.copyright}>
            &copy; {currentYear} Nikhil's Jeans. All rights reserved.
          </div>
          <div className={styles.paymentMethods}>
            <img src="/images/payment-methods.png" alt="Payment Methods" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 