import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP } from 'react-icons/fa';
import styles from '../styles/Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContainer}>
          <div className={styles.footerColumn}>
            <h3>Nikhil&apos;s Jeans</h3>
            <ul>
              <li><Link href="/about">About Us</Link></li>
              <li><Link href="/stores">Our Stores</Link></li>
              <li><Link href="/blog">Blog</Link></li>
              <li><Link href="/careers">Careers</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Categories</h3>
            <ul>
              <li><Link href="/men/jeans">Men&apos;s Jeans</Link></li>
              <li><Link href="/women/jeans">Women&apos;s Jeans</Link></li>
              <li><Link href="/shirts">Shirts</Link></li>
              <li><Link href="/accessories">Accessories</Link></li>
              <li><Link href="/sale">Sale</Link></li>
            </ul>
          </div>
          <div className={styles.footerColumn}>
            <h3>Customer Service</h3>
            <ul>
              <li><Link href="/faq">FAQ</Link></li>
              <li><Link href="/shipping">Shipping & Returns</Link></li>
              <li><Link href="/size-guide">Size Guide</Link></li>
              <li><Link href="/track-order">Track Order</Link></li>
              <li><Link href="/gift-cards">Gift Cards</Link></li>
            </ul>
          </div>
          <div className={`${styles.footerColumn} ${styles.newsletter}`}>
            <h3>Stay Updated</h3>
            <p>Subscribe to receive updates on new arrivals and special promotions.</p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Your email address" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.copyright}>&copy; {new Date().getFullYear()} Nikhil&apos;s Jeans. All rights reserved.</p>
          <div className={styles.socialIcons}>
            <Link href="#" aria-label="Facebook"><FaFacebookF /></Link>
            <Link href="#" aria-label="Twitter"><FaTwitter /></Link>
            <Link href="#" aria-label="Instagram"><FaInstagram /></Link>
            <Link href="#" aria-label="Pinterest"><FaPinterestP /></Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 