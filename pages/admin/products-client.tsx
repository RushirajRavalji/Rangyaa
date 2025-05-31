import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import styles from '../../styles/AdminPanel.module.css';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaSearch, FaSort, FaSave, FaAngleLeft, FaSortUp, FaSortDown, FaThList, FaTh } from 'react-icons/fa';
import { Product } from '../../data/products';
import ClientOnly from '../../components/ClientOnly';

// Admin email for authorization
const ADMIN_EMAIL = 'driger.ray.dranzer@gmail.com';

// Default form values for new product
const defaultProductForm = {
  name: '',
  description: '',
  price: 0,
  originalPrice: 0,
  discount: 0,
  category: '',
  subcategory: '',
  stock: 0,
  sizes: ['S', 'M', 'L', 'XL'] as string[],
  colors: [] as { name: string; code: string }[],
  tags: [] as string[],
  image: '',
  featured: false,
  new: false,
  id: '' // Add id property with empty string as default
};

// Available categories for the datalist
const categories = [
  { id: 'men', name: 'Men' },
  { id: 'women', name: 'Women' },
  { id: 'kids', name: 'Kids' },
  { id: 'unisex', name: 'Unisex' }
];

// Available subcategories for the datalist
const subcategories = [
  { id: 'jeans', name: 'Jeans' },
  { id: 'shirts', name: 'Shirts' },
  { id: 't-shirts', name: 'T-Shirts' },
  { id: 'trousers', name: 'Trousers' },
  { id: 'jackets', name: 'Jackets' },
  { id: 'sweaters', name: 'Sweaters' },
  { id: 'hoodies', name: 'Hoodies' },
  { id: 'joggers', name: 'Joggers' },
  { id: 'accessories', name: 'Accessories' }
];

export default function AdminProductsClient() {
  const { user } = useAuth();
  const { products, addNewProduct, updateExistingProduct, removeProduct, uploadImage } = useProducts();
  
  // Form state
  const [productForm, setProductForm] = useState<Product>(defaultProductForm as unknown as Product);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  // Refs
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Search and sort state
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<keyof Product>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // View state
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Loading and error states
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter products based on search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ).sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortOrder === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });
  
  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setProductForm(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'price' || name === 'originalPrice' || name === 'discount' || name === 'stock') {
      setProductForm(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setProductForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  // Handle array input changes (sizes, tags)
  const handleArrayChange = (field: keyof Product, value: string) => {
    const items = value.split(',').map(item => item.trim()).filter(item => item !== '');
    setProductForm(prev => ({ ...prev, [field]: items }));
  };
  
  // Handle colors input (special format: name:code, name:code)
  const handleColorsChange = (value: string) => {
    const colorPairs = value.split(',').map(pair => pair.trim());
    const colors = colorPairs.map(pair => {
      const [name, code] = pair.split(':').map(item => item.trim());
      return { name: name || '', code: code || '' };
    }).filter(color => color.name && color.code);
    
    setProductForm(prev => ({ ...prev, colors }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (loading) {
      return;
    }
    
    // Validate form
    const errors: Record<string, string> = {};
    
    if (!productForm.name) errors.name = 'Product name is required';
    if (!productForm.category) errors.category = 'Category is required';
    if (!productForm.subcategory) errors.subcategory = 'Subcategory is required';
    if (!productForm.description) errors.description = 'Description is required';
    if (productForm.price <= 0) errors.price = 'Price must be greater than 0';
    if (productForm.stock < 0) errors.stock = 'Stock cannot be negative';
    if (!isEditing && !imagePreview) errors.image = 'Product image is required';
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    
    // Add or combine tags to include category and subcategory for better filtering
    const updatedForm = { ...productForm };
    
    // Add tags for category and subcategory if they don't exist
    if (!updatedForm.tags) {
      updatedForm.tags = [];
    }
    
    // Make sure category and subcategory are included in tags
    if (updatedForm.category && !updatedForm.tags.includes(updatedForm.category)) {
      updatedForm.tags.push(updatedForm.category);
    }
    
    if (updatedForm.subcategory && !updatedForm.tags.includes(updatedForm.subcategory)) {
      updatedForm.tags.push(updatedForm.subcategory);
    }
    
    // Create combined tags like "men-shirts" for better filtering
    const combinedTag = `${updatedForm.category}-${updatedForm.subcategory}`;
    if (!updatedForm.tags.includes(combinedTag)) {
      updatedForm.tags.push(combinedTag);
    }
    
    try {
      setLoading(true);
      setError(null);
      
      console.log(`${isEditing ? 'Updating' : 'Adding'} product: ${updatedForm.name}`);
      
      if (isEditing) {
        await updateExistingProduct(updatedForm.id, updatedForm);
        setSubmitStatus({
          type: 'success',
          message: 'Product updated successfully!'
        });
      } else {
        await addNewProduct(updatedForm);
        setSubmitStatus({
          type: 'success',
          message: 'Product added successfully!'
        });
      }
      
      // Reset form after successful submission
      resetForm();
      setIsAdding(false);
      setIsEditing(false);
      
      // Refresh products to ensure the UI is up to date
      await refreshProducts();
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error submitting product:', error);
      setSubmitStatus({
        type: 'error',
        message: `Failed to ${isEditing ? 'update' : 'add'} product. Please try again.`
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      setLoading(true);
      setSubmitStatus(null); // Clear any previous status
      
      // Create a preview for immediate feedback
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Upload to Firebase Storage
      const imageUrl = await uploadImage(file);
      
      // Update form with the Firebase Storage URL
      setProductForm(prev => ({ ...prev, image: imageUrl }));
      
      // Clear image error if it exists
      if (formErrors.image) {
        setFormErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
      
      setSubmitStatus({
        type: 'success',
        message: 'Image uploaded successfully!'
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setImagePreview(null); // Clear preview on error
      
      // Set image-specific error
      setFormErrors(prev => ({
        ...prev,
        image: error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      }));
      
      setSubmitStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to upload image. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Reset form to default values
  const resetForm = () => {
    setProductForm(defaultProductForm as unknown as Product);
    setImagePreview(null);
    setFormErrors({});
    setSubmitStatus(null);
    
    // Clear file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle editing a product
  const handleEditProduct = (product: Product) => {
    setIsEditing(true);
    setIsAdding(true);
    
    // Populate form with product data
    setProductForm({
      ...product,
      // Ensure subcategory is properly set
      subcategory: product.subcategory || '',
      // Handle tags, sizes, and colors which could be missing or in wrong format
      tags: Array.isArray(product.tags) ? product.tags : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : ['S', 'M', 'L', 'XL'],
      colors: Array.isArray(product.colors) ? product.colors : []
    });
    
    // Set image preview if available
    if (product.image) {
      setImagePreview(product.image);
    }
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  // Handle delete product
  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }
    
    try {
      setLoading(true);
      await removeProduct(id);
      setSubmitStatus({
        type: 'success',
        message: 'Product deleted successfully!'
      });
      
      // Clear status message after 3 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 3000);
    } catch (error) {
      console.error('Error deleting product:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to delete product. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sort
  const handleSort = (field: keyof Product) => {
    if (sortField === field) {
      // Toggle sort order if clicking the same field
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort field and default to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  // Refresh products
  const refreshProducts = async () => {
    try {
      setLoading(true);
      // Use the context function to refresh products from Firestore
      await useProducts().refreshProducts();
      // Reset search and sort
      setSearchTerm('');
      setSortField('name');
      setSortOrder('asc');
      console.log('Products refreshed from Firestore');
    } catch (error) {
      console.error('Error refreshing products:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Sort icon component
  const SortIcon = ({ field }: { field: keyof Product }) => (
    <ClientOnly>
      <span className={styles.sortIcon}>
        {sortField === field 
          ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)
          : <FaSort />
        }
      </span>
    </ClientOnly>
  );

  // Mobile card component for products
  const ProductCard = ({ product }: { product: Product }) => {
    return (
      <div className={styles.mobileCard}>
        <div className={styles.mobileCardHeader}>
          <span className={styles.mobileCardTitle}>
            {product.name}
          </span>
          <span className={`${styles.stockBadge} ${product.stock === 0 ? styles.outOfStock : ''}`}>
            {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
          </span>
        </div>
        
        <div className={styles.mobileCardRow} style={{ alignItems: 'center', gap: '10px' }}>
          {product.image ? (
            <img 
              src={product.image} 
              alt={product.name} 
              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
            />
          ) : (
            <div style={{ width: '60px', height: '60px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', color: '#9ca3af' }}>
              No Image
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div className={styles.mobileCardRow}>
              <span className={styles.mobileCardLabel}>Category:</span>
              <span className={styles.mobileCardValue}>{product.category}</span>
            </div>
            <div className={styles.mobileCardRow}>
              <span className={styles.mobileCardLabel}>Price:</span>
              <span className={styles.mobileCardValue}>
                ₹{product.price.toFixed(2)}
                {product.originalPrice && product.originalPrice > 0 && (
                  <span style={{ textDecoration: 'line-through', color: '#6b7280', marginLeft: '5px', fontSize: '0.8rem' }}>
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <div className={styles.mobileCardActions}>
          <button 
            onClick={() => handleEditProduct(product)}
            className={`${styles.adminActionBtn} ${styles.edit}`}
          >
            <FaEdit /> Edit
          </button>
          <button 
            onClick={() => handleDeleteProduct(product.id)}
            className={styles.adminActionBtn}
          >
            <FaTrash /> Delete
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`${styles.adminPanelContainer} ${styles[viewMode + 'View']}`}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminPanelTitle}>Product Management</h1>
        <button 
          className={styles.addProductBtn}
          onClick={() => {
            resetForm();
            setIsAdding(true);
          }}
        >
          <FaPlus /> Add Product
        </button>
      </div>

      <div className={styles.adminNav}>
        <Link href="/admin/orders">Dashboard</Link>
        <Link href="/admin/products" className={styles.active}>Products</Link>
        <Link href="/admin/banners">Banners</Link>
      </div>

      <ClientOnly>
        <div className={styles.adminActions}>
          <button 
            className={`${styles.actionButton} ${isAdding ? '' : styles.addProduct}`}
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
            }}
          >
            {isAdding ? <FaTimes /> : <FaPlus />}
            {isAdding ? 'Cancel' : 'Add Product'}
          </button>
        </div>
        
        {/* Display success/error messages */}
        {submitStatus && (
          <div className={`${styles.actionMessage} ${styles[submitStatus.type]}`}>
            {submitStatus.message}
          </div>
        )}
      </ClientOnly>

      {/* Product Form - appears when adding or editing */}
      <ClientOnly>
        {isAdding && (
          <div className={styles.formContainer}>
            <h2>{isEditing ? 'Edit Product' : 'Add New Product'}</h2>
            <form ref={formRef} onSubmit={handleSubmit} className={styles.adminForm}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">
                    Product Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={productForm.name}
                    onChange={handleChange}
                    className={formErrors.name ? styles.errorInput : ''}
                    placeholder="Enter product name"
                  />
                  {formErrors.name && <div className={styles.errorText}>{formErrors.name}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="category">
                    Category*
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={productForm.category}
                    onChange={handleChange}
                    list="categories"
                    className={formErrors.category ? styles.errorInput : ''}
                    placeholder="Select or enter category"
                  />
                  <datalist id="categories">
                    {categories.map((category) => (
                      <option key={category.id} value={category.id} />
                    ))}
                  </datalist>
                  {formErrors.category && <div className={styles.errorText}>{formErrors.category}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="subcategory">
                    Subcategory*
                  </label>
                  <input
                    type="text"
                    id="subcategory"
                    name="subcategory"
                    value={productForm.subcategory}
                    onChange={handleChange}
                    list="subcategories"
                    className={formErrors.subcategory ? styles.errorInput : ''}
                    placeholder="Select or enter subcategory"
                  />
                  <datalist id="subcategories">
                    {subcategories.map((subcategory) => (
                      <option key={subcategory.id} value={subcategory.id} />
                    ))}
                  </datalist>
                  {formErrors.subcategory && <div className={styles.errorText}>{formErrors.subcategory}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="price">
                    Price*
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    step="0.01"
                    value={productForm.price}
                    onChange={handleChange}
                    className={formErrors.price ? styles.errorInput : ''}
                    placeholder="0.00"
                  />
                  {formErrors.price && <div className={styles.errorText}>{formErrors.price}</div>}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="originalPrice">
                    Original Price (for discounted items)
                  </label>
                  <input
                    type="number"
                    id="originalPrice"
                    name="originalPrice"
                    min="0"
                    step="0.01"
                    value={productForm.originalPrice || ''}
                    onChange={handleChange}
                    placeholder="0.00"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="discount">
                    Discount % (0-100)
                  </label>
                  <input
                    type="number"
                    id="discount"
                    name="discount"
                    min="0"
                    max="100"
                    step="1"
                    value={productForm.discount || ''}
                    onChange={handleChange}
                    placeholder="0"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="stock">
                    Stock*
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    min="0"
                    step="1"
                    value={productForm.stock}
                    onChange={handleChange}
                    className={formErrors.stock ? styles.errorInput : ''}
                    placeholder="0"
                  />
                  {formErrors.stock && <div className={styles.errorText}>{formErrors.stock}</div>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">
                  Description*
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={productForm.description}
                  onChange={handleChange}
                  rows={4}
                  className={formErrors.description ? styles.errorInput : ''}
                  placeholder="Enter product description"
                />
                {formErrors.description && <div className={styles.errorText}>{formErrors.description}</div>}
              </div>

              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="sizes">
                    Sizes (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="sizes"
                    name="sizes"
                    value={productForm.sizes?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('sizes', e.target.value)}
                    placeholder="S, M, L, XL"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="tags">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    id="tags"
                    name="tags"
                    value={productForm.tags?.join(', ') || ''}
                    onChange={(e) => handleArrayChange('tags', e.target.value)}
                    placeholder="jeans, casual, trendy"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="colors">
                  Colors (format: name:code, name:code)
                </label>
                <input
                  type="text"
                  id="colors"
                  name="colors"
                  value={productForm.colors?.map(c => `${c.name}:${c.code}`).join(', ') || ''}
                  onChange={(e) => handleColorsChange(e.target.value)}
                  placeholder="Red:#ff0000, Blue:#0000ff, Black:#000000"
                />
              </div>

              <div className={styles.formFeatures}>
                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={productForm.featured}
                    onChange={handleChange}
                  />
                  <label htmlFor="featured">Featured Product</label>
                </div>

                <div className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    id="new"
                    name="new"
                    checked={productForm.new}
                    onChange={handleChange}
                  />
                  <label htmlFor="new">New Product</label>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="image">
                  Product Image*
                  <div className={styles.imageUpload}>
                    <input
                      type="file"
                      id="image"
                      name="image"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      className={formErrors.image ? styles.errorInput : ''}
                      style={{ display: 'none' }}
                      capture="environment"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={styles.uploadButton}
                    >
                      <FaImage /> Choose Image
                    </button>
                    {imagePreview && (
                      <div className={styles.imagePreview}>
                        <img src={imagePreview} alt="Preview" />
                      </div>
                    )}
                    {formErrors.image && <div className={styles.errorText}>{formErrors.image}</div>}
                  </div>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  <FaSave />
                  {isEditing ? 'Update Product' : 'Add Product'}
                </button>
                <button 
                  type="button" 
                  onClick={resetForm}
                  className={styles.cancelButton}
                >
                  <FaTimes />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </ClientOnly>

      {/* Product Listing */}
      <div className={styles.productListingContainer}>
        <div className={styles.horizontalControls}>
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              value={sortField as string}
              onChange={(e) => {
                setSortField(e.target.value as keyof Product);
                setSortOrder('asc');
              }}
              className={styles.filterSelect}
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="stock">Sort by Stock</option>
              <option value="category">Sort by Category</option>
            </select>
            
            <button 
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className={styles.adminActionBtn}
              style={{ minWidth: 'auto', padding: '0.5rem' }}
            >
              {sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />}
            </button>
          </div>
          
          <div className={styles.viewToggleContainer}>
            <span className={styles.viewToggleLabel}>View:</span>
            <div className={styles.viewToggleButtons}>
              <button 
                className={`${styles.viewToggleButton} ${viewMode === 'list' ? styles.active : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FaThList /> List
              </button>
              <button 
                className={`${styles.viewToggleButton} ${viewMode === 'grid' ? styles.active : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FaTh /> Grid
              </button>
            </div>
          </div>
          
          <div className={styles.actionSection}>
            <button 
              onClick={refreshProducts}
              className={styles.cancelButton}
            >
              <FaSort /> Reset Filters
            </button>
            
            <button 
              className={styles.addProductBtn}
              onClick={() => {
                resetForm();
                setIsAdding(true);
                // Scroll to top when adding a product
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            >
              <FaPlus /> Add Product
            </button>
          </div>
        </div>

        <ClientOnly>
          {loading ? (
            <div className={styles.loadingState}>Loading products...</div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : products.length === 0 ? (
            <div className={styles.emptyState}>
              No products found. Click "Add Product" to create your first product.
            </div>
          ) : (
            <>
              {/* Desktop table view */}
              <div className={styles.tableContainer}>
                <table className={styles.adminTable}>
                  <thead>
                    <tr>
                      <th className={styles.imageCell}>Image</th>
                      <th 
                        onClick={() => handleSort('name')}
                        className={styles.sortableHeader}
                      >
                        Name <SortIcon field="name" />
                      </th>
                      <th 
                        onClick={() => handleSort('category')} 
                        className={styles.sortableHeader}
                      >
                        Category <SortIcon field="category" />
                      </th>
                      <th 
                        onClick={() => handleSort('price')} 
                        className={styles.sortableHeader}
                      >
                        Price <SortIcon field="price" />
                      </th>
                      <th 
                        onClick={() => handleSort('stock')} 
                        className={styles.sortableHeader}
                      >
                        Stock <SortIcon field="stock" />
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className={styles.productRow}>
                        <td className={styles.imageCell}>
                          {product.image ? (
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className={styles.productThumb}
                            />
                          ) : (
                            <div className={styles.noImage}>No Image</div>
                          )}
                        </td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>
                          ₹{product.price.toFixed(2)}
                          {product.originalPrice && product.originalPrice > 0 && (
                            <span className={styles.originalPrice}>
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`${styles.stockBadge} ${product.stock === 0 ? styles.outOfStock : ''}`}>
                            {product.stock === 0 ? 'Out of Stock' : product.stock}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionButtons}>
                            <button 
                              onClick={() => handleEditProduct(product)}
                              className={`${styles.adminActionBtn} ${styles.edit}`}
                            >
                              <FaEdit /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteProduct(product.id)}
                              className={styles.adminActionBtn}
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile card view */}
              <div className={styles.mobileCardView}>
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {/* Modern card grid view */}
              <div className={styles.productCardGrid}>
                {filteredProducts.map((product) => (
                  <div key={product.id} className={styles.productCard}>
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className={styles.productCardImage}
                      />
                    ) : (
                      <div style={{ 
                        height: '200px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        backgroundColor: '#f3f4f6'
                      }}>
                        <FaImage style={{ fontSize: '48px', color: '#d1d5db' }} />
                      </div>
                    )}
                    
                    <div className={styles.productCardContent}>
                      <div className={styles.productCardHeader}>
                        <h3 className={styles.productCardTitle}>{product.name}</h3>
                        <div>
                          <span className={styles.productCardPrice}>₹{product.price.toFixed(2)}</span>
                          {product.originalPrice && product.originalPrice > 0 && (
                            <span className={styles.productCardOriginalPrice}>
                              ₹{product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.productCardCategory}>
                        {product.category}
                      </div>
                      
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>Stock:</span>
                        <span className={`${styles.stockBadge} ${product.stock === 0 ? styles.outOfStock : ''}`}>
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} in stock`}
                        </span>
                      </div>
                      
                      <div className={styles.productCardFooter}>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className={`${styles.adminActionBtn} ${styles.edit}`}
                        >
                          <FaEdit /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className={styles.adminActionBtn}
                        >
                          <FaTrash /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </ClientOnly>
      </div>
      
      {/* Mobile Action Bar */}
      <div className={styles.mobileActionBar}>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.adminActionBtn} ${styles.edit}`}
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
              if (!isAdding) {
                // Scroll to top when adding a product
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }
            }}
          >
            {isAdding ? <FaTimes /> : <FaPlus />} {isAdding ? 'Cancel' : 'Add'}
          </button>
          {!isAdding && (
            <>
              <button 
                className={styles.adminActionBtn}
                onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              >
                {viewMode === 'list' ? <FaTh /> : <FaThList />}
                {viewMode === 'list' ? 'Grid' : 'List'}
              </button>
              <button 
                className={styles.adminActionBtn}
                onClick={() => {
                  const searchInput = document.querySelector(`.${styles.searchBox} input`);
                  if (searchInput) (searchInput as HTMLInputElement).focus();
                }}
              >
                <FaSearch /> Search
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 