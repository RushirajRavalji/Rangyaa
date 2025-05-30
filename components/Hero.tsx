import { useState, useEffect, useRef } from 'react';
import { FaArrowRight } from 'react-icons/fa';
import styles from '../styles/Hero.module.css';
import { useBanners } from '../context/BannerContext';
import { FirebaseBanner } from '../utils/firebaseBanners';

interface HeroProps {
  page: string;
  heading: string;
  subheading?: string;
  backgroundImage?: string;
  height?: 'small' | 'medium' | 'large';
  textAlign?: 'left' | 'center' | 'right';
  textColor?: string;
  overlay?: boolean;
  overlayOpacity?: number;
  buttonText?: string;
  buttonLink?: string;
  animated?: boolean;
}

const Hero: React.FC<HeroProps> = ({
  page,
  heading,
  subheading,
  backgroundImage,
  height = 'medium',
  textAlign = 'center',
  textColor = '#ffffff',
  overlay = true,
  overlayOpacity = 0.4,
  buttonText,
  buttonLink,
  animated = true
}) => {
  const { getBannersForPage, loading } = useBanners();
  const [bannerImage, setBannerImage] = useState<string | undefined>(backgroundImage);
  const [isLoaded, setIsLoaded] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  // Fetch banner for the current page
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const banners = await getBannersForPage(page);
        if (banners && banners.length > 0) {
          setBannerImage(banners[0].imageUrl);
        } else if (backgroundImage) {
          setBannerImage(backgroundImage);
        }
      } catch (error) {
        console.error('Error fetching banner:', error);
        // Fallback to provided background image
        if (backgroundImage) {
          setBannerImage(backgroundImage);
        }
      }
    };

    fetchBanner();
  }, [page, backgroundImage, getBannersForPage]);

  // Animation on load
  useEffect(() => {
    if (animated && heroRef.current) {
      setIsLoaded(true);
    }
  }, [animated]);

  // Height classes
  const heightClass = {
    small: styles.heroSmall,
    medium: styles.heroMedium,
    large: styles.heroLarge
  }[height];

  // Text alignment classes
  const alignClass = {
    left: styles.textLeft,
    center: styles.textCenter,
    right: styles.textRight
  }[textAlign];

  return (
    <div 
      ref={heroRef}
      className={`${styles.hero} ${heightClass} ${isLoaded ? styles.loaded : ''} hero-section`}
      style={{ 
        backgroundImage: bannerImage ? `url(${bannerImage})` : undefined,
      }}
    >
      {overlay && (
        <div 
          className={styles.overlay} 
          style={{ opacity: overlayOpacity }}
        />
      )}
      
      <div className={`${styles.heroContent} ${alignClass}`}>
        <h1 className="hero-text" style={{ color: textColor }}>{heading}</h1>
        
        {subheading && (
          <p className={`${styles.subheading} text-readable`} style={{ color: textColor }}>
            {subheading}
          </p>
        )}
        
        {buttonText && buttonLink && (
          <a href={buttonLink} className={`${styles.heroButton} explore-btn`}>
            {buttonText} <FaArrowRight className={styles.buttonIcon} />
          </a>
        )}
      </div>
    </div>
  );
};

export default Hero; 