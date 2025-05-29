import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';

interface SearchProps {
  onClose: () => void;
}

const Search = ({ onClose }: SearchProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Focus input when search is opened
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  
  // Handle search submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      onClose();
      setSearchTerm('');
    }
  };

  return (
    <div className="search-overlay active">
      <form className="search-container" onSubmit={handleSubmit}>
        <input 
          type="text" 
          name="search" 
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for products..." 
          autoFocus 
        />
        <button type="submit" className="search-button"><FaSearch /></button>
      </form>
      
      <div className="search-results">
        {/* Search results will be dynamically added here */}
      </div>
      
      <button 
        className="close-search" 
        aria-label="Close Search" 
        onClick={() => {
          onClose();
          setSearchTerm('');
        }}
      >
        <FaTimes />
      </button>
    </div>
  );
};

export default Search; 