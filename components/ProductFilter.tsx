import { useState, useEffect } from 'react';
import { FaFilter, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import styles from '../styles/ProductFilter.module.css';

interface FilterOption {
  label: string;
  value: string;
}

interface PriceRange {
  min: number;
  max: number;
}

interface ProductFilterProps {
  categories: FilterOption[];
  sizes: FilterOption[];
  colors: FilterOption[];
  initialFilters?: {
    category?: string;
    sizes?: string[];
    colors?: string[];
    priceRange?: PriceRange;
    sort?: string;
  };
  onFilterChange: (filters: any) => void;
  onMobileToggle?: (isOpen: boolean) => void;
}

const ProductFilter = ({
  categories,
  sizes,
  colors,
  initialFilters = {},
  onFilterChange,
  onMobileToggle
}: ProductFilterProps) => {
  const [filters, setFilters] = useState({
    category: initialFilters.category || '',
    sizes: initialFilters.sizes || [],
    colors: initialFilters.colors || [],
    priceRange: initialFilters.priceRange || { min: 0, max: 10000 },
    sort: initialFilters.sort || 'featured'
  });

  const [expanded, setExpanded] = useState({
    category: true,
    sizes: true,
    colors: true,
    price: true
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    if (typeof window !== 'undefined') {
      checkIfMobile();
      window.addEventListener('resize', checkIfMobile);
      return () => window.removeEventListener('resize', checkIfMobile);
    }
  }, []);

  // Notify parent component when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleMobileFilters = () => {
    const newState = !mobileFiltersOpen;
    setMobileFiltersOpen(newState);
    if (onMobileToggle) {
      onMobileToggle(newState);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => ({
      ...prev,
      category: prev.category === category ? '' : category
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters(prev => {
      const sizes = [...prev.sizes];
      const index = sizes.indexOf(size);
      
      if (index === -1) {
        sizes.push(size);
      } else {
        sizes.splice(index, 1);
      }
      
      return { ...prev, sizes };
    });
  };

  const handleColorToggle = (color: string) => {
    setFilters(prev => {
      const colors = [...prev.colors];
      const index = colors.indexOf(color);
      
      if (index === -1) {
        colors.push(color);
      } else {
        colors.splice(index, 1);
      }
      
      return { ...prev, colors };
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = parseInt(value) || 0;
    
    setFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: numValue
      }
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({
      ...prev,
      sort: e.target.value
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      sizes: [],
      colors: [],
      priceRange: { min: 0, max: 10000 },
      sort: 'featured'
    });
  };

  const filtersCount = (
    (filters.category ? 1 : 0) +
    filters.sizes.length +
    filters.colors.length +
    (filters.priceRange.min > 0 || filters.priceRange.max < 10000 ? 1 : 0)
  );

  return (
    <>
      {/* Mobile filter toggle */}
      {isMobile && (
        <div className={styles.mobileFilterToggle}>
          <button onClick={toggleMobileFilters} className={styles.mobileFilterButton}>
            <FaFilter /> Filters {filtersCount > 0 && <span className={styles.filterCount}>{filtersCount}</span>}
          </button>
          <select 
            value={filters.sort} 
            onChange={handleSortChange}
            className={styles.sortSelect}
          >
            <option value="featured">Featured</option>
            <option value="newest">Newest</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      )}

      {/* Filter sidebar */}
      <div className={`${styles.filterSidebar} ${mobileFiltersOpen ? styles.open : ''}`}>
        <div className={styles.filterHeader}>
          <h3>Filters</h3>
          {isMobile && (
            <button onClick={toggleMobileFilters} className={styles.closeButton}>
              <FaTimes />
            </button>
          )}
        </div>

        {!isMobile && (
          <div className={styles.sortContainer}>
            <label htmlFor="sort">Sort By</label>
            <select 
              id="sort" 
              value={filters.sort} 
              onChange={handleSortChange}
              className={styles.sortSelect}
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        )}

        {filtersCount > 0 && (
          <button onClick={clearFilters} className={styles.clearFilters}>
            Clear All Filters
          </button>
        )}

        {/* Category filter */}
        <div className={styles.filterSection}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection('category')}
          >
            <h4>Category</h4>
            <span className={styles.toggleIcon}>
              {expanded.category ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          
          {expanded.category && (
            <div className={styles.filterOptions}>
              {categories.map(category => (
                <label key={category.value} className={styles.filterOption}>
                  <input
                    type="radio"
                    name="category"
                    checked={filters.category === category.value}
                    onChange={() => handleCategoryChange(category.value)}
                  />
                  <span>{category.label}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Size filter */}
        <div className={styles.filterSection}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection('sizes')}
          >
            <h4>Size</h4>
            <span className={styles.toggleIcon}>
              {expanded.sizes ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          
          {expanded.sizes && (
            <div className={styles.filterOptions}>
              <div className={styles.sizeGrid}>
                {sizes.map(size => (
                  <label 
                    key={size.value} 
                    className={`${styles.sizeBox} ${filters.sizes.includes(size.value) ? styles.active : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.sizes.includes(size.value)}
                      onChange={() => handleSizeToggle(size.value)}
                    />
                    <span>{size.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color filter */}
        <div className={styles.filterSection}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection('colors')}
          >
            <h4>Color</h4>
            <span className={styles.toggleIcon}>
              {expanded.colors ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          
          {expanded.colors && (
            <div className={styles.filterOptions}>
              <div className={styles.colorGrid}>
                {colors.map(color => (
                  <label 
                    key={color.value} 
                    className={`${styles.colorBox} ${filters.colors.includes(color.value) ? styles.active : ''}`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  >
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(color.value)}
                      onChange={() => handleColorToggle(color.value)}
                    />
                    {filters.colors.includes(color.value) && (
                      <span className={styles.colorCheck}>✓</span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Price range filter */}
        <div className={styles.filterSection}>
          <div 
            className={styles.sectionHeader}
            onClick={() => toggleSection('price')}
          >
            <h4>Price Range</h4>
            <span className={styles.toggleIcon}>
              {expanded.price ? <FaChevronUp /> : <FaChevronDown />}
            </span>
          </div>
          
          {expanded.price && (
            <div className={styles.filterOptions}>
              <div className={styles.priceInputs}>
                <div className={styles.priceInput}>
                  <label htmlFor="min-price">Min</label>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.currencySymbol}>₹</span>
                    <input
                      id="min-price"
                      type="number"
                      min="0"
                      value={filters.priceRange.min}
                      onChange={(e) => handlePriceChange('min', e.target.value)}
                    />
                  </div>
                </div>
                <div className={styles.priceInput}>
                  <label htmlFor="max-price">Max</label>
                  <div className={styles.priceInputWrapper}>
                    <span className={styles.currencySymbol}>₹</span>
                    <input
                      id="max-price"
                      type="number"
                      min="0"
                      value={filters.priceRange.max}
                      onChange={(e) => handlePriceChange('max', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {isMobile && (
          <div className={styles.mobileActions}>
            <button onClick={clearFilters} className={styles.clearButton}>
              Clear All
            </button>
            <button onClick={toggleMobileFilters} className={styles.applyButton}>
              Apply Filters
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default ProductFilter; 