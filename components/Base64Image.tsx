import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getImageById } from '../utils/firestore';
import PlaceholderImage from './PlaceholderImage';

interface Base64ImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  priority?: boolean;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
}

const Base64Image: React.FC<Base64ImageProps> = ({ 
  src, 
  alt, 
  width, 
  height, 
  className, 
  style,
  priority = false,
  objectFit = 'cover'
}) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use fallback image for placeholder to ensure consistent dimensions
  const fallbackSrc = '/images/placeholder.jpg';

  useEffect(() => {
    let isMounted = true;
    
    const loadImage = async () => {
      if (!src) {
        console.error('No image source provided');
        if (isMounted) {
          setError('No image source provided');
          setLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setError(null);
        }

        // Check if it's a base64 image
        if (src.startsWith('base64://')) {
          console.log(`Loading base64 image: ${src}`);
          const imageId = src.replace('base64://', '');
          const base64Data = await getImageById(imageId);
          
          if (isMounted) {
            if (base64Data && base64Data !== fallbackSrc) {
              console.log(`Base64 image loaded successfully: ${imageId}`);
              setImageSrc(base64Data);
            } else {
              console.error(`Failed to load base64 image: ${imageId}`);
              setImageSrc(fallbackSrc);
              setError('Failed to load base64 image');
            }
          }
        } else {
          // Regular URL
          console.log(`Loading regular image: ${src}`);
          if (isMounted) {
            setImageSrc(src);
          }
        }
      } catch (err) {
        console.error('Error loading image:', err);
        if (isMounted) {
          setError('Failed to load image');
          setImageSrc(fallbackSrc);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadImage();
    
    // Cleanup function to prevent memory leaks
    return () => {
      isMounted = false;
    };
  }, [src, fallbackSrc]);

  if (loading) {
    return (
      <div 
        className={`${className || ''} image-placeholder`}
        style={{
          width: width || '100%',
          height: height || 300,
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style
        }}
      >
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !imageSrc) {
    console.log(`Using fallback image due to error: ${error}`);
    // Return a regular image tag for fallback to avoid Next.js image loading issues
    return (
      <img
        src={fallbackSrc}
        alt={alt}
        className={className}
        style={{
          width: width || '100%',
          height: height || 'auto',
          objectFit,
          ...style
        }}
      />
    );
  }

  // For base64 images, use regular img tag
  if (imageSrc.startsWith('data:')) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        className={className}
        style={{
          width: width || '100%',
          height: height || 'auto',
          objectFit,
          ...style
        }}
        onError={(e) => {
          console.error(`Error loading base64 image: ${alt}`);
          e.currentTarget.src = fallbackSrc;
        }}
      />
    );
  }

  // For regular URLs, use img tag instead of Next.js Image to avoid potential loading issues
  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      style={{
        width: width || '100%',
        height: height || 'auto',
        objectFit,
        ...style
      }}
      loading={priority ? "eager" : "lazy"}
      onError={(e) => {
        console.error(`Error loading image URL: ${imageSrc}`);
        e.currentTarget.src = fallbackSrc;
      }}
    />
  );
};

export default Base64Image; 