import React from 'react';
import { FaImage } from 'react-icons/fa';

interface PlaceholderImageProps {
  width?: number | string;
  height?: number | string;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}

const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width = '100%',
  height = 300,
  text = 'No Image Available',
  className = '',
  style = {}
}) => {
  return (
    <div 
      className={`placeholder-image ${className}`}
      style={{
        width,
        height,
        backgroundColor: '#f8f8f8',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        color: '#888',
        ...style
      }}
    >
      <FaImage style={{ fontSize: '2rem', marginBottom: '0.5rem', opacity: 0.5 }} />
      <span style={{ fontSize: '0.875rem' }}>{text}</span>
    </div>
  );
};

export default PlaceholderImage; 