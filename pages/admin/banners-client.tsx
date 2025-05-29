import { useState, useRef, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useBanners } from '../../context/BannerContext';
import styles from '../../styles/AdminPanel.module.css';
import Link from 'next/link';
import { FaPlus, FaEdit, FaTrash, FaImage, FaTimes, FaSearch, FaSort, FaSave, FaAngleLeft, FaSortUp, FaSortDown, FaEye, FaCheck, FaUpload } from 'react-icons/fa';
import { FirebaseBanner } from '../../utils/firebaseBanners';
import ClientOnly from '../../components/ClientOnly';
import { uploadBannerImage } from '../../utils/firebaseStorage';

// Admin email for authorization
const ADMIN_EMAIL = 'driger.ray.dranzer@gmail.com';

// Define banner form type
interface BannerFormData {
  page: string;
  imageUrl: string;
  // These fields are kept in the interface but not shown in the UI
  title: string;
  subtitle: string;
  textColor: string;
  order: number;
}

// Default form values for new banner
const defaultBannerForm: BannerFormData = {
  page: 'home',
  imageUrl: '',
  // Default values for fields that are no longer in the UI
  title: '',
  subtitle: '',
  textColor: '#ffffff',
  order: 1
};

// Available pages for banners
const availablePages = [
  { value: 'home', label: 'Home Page' },
  { value: 'men', label: 'Men\'s Page' },
  { value: 'products', label: 'Products Page' },
  { value: 'sale', label: 'Sale Page' },
  { value: 'new-arrivals', label: 'New Arrivals Page' }
];

// Define form errors type
interface FormErrors {
  page?: string;
  imageUrl?: string;
}

// Define submit status type
interface SubmitStatus {
  type: 'success' | 'error' | 'info';
  message: string;
}

export default function AdminBannersClient() {
  const { user } = useAuth();
  const {
    banners,
    loading,
    error,
    addNewBanner,
    updateExistingBanner,
    removeBanner,
    refreshBanners
  } = useBanners();

  // State variables
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [bannerForm, setBannerForm] = useState<BannerFormData>(defaultBannerForm);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortField, setSortField] = useState<string>('page');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterPage, setFilterPage] = useState<string>('all');
  const [previewBanner, setPreviewBanner] = useState<FirebaseBanner | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // References
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort banners
  const filteredBanners = useMemo(() => {
    return banners
      .filter(banner => {
        // Filter by page first (most efficient)
        if (filterPage !== 'all' && banner.page !== filterPage) {
          return false;
        }
        
        // If no search term, include the banner
        if (!searchTerm.trim()) {
          return true;
        }
        
        // Case insensitive search
        const searchLower = searchTerm.toLowerCase().trim();
        
        // Search in page (always exists)
        if (banner.page.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        // Search in title and subtitle (might be undefined)
        if (banner.title && banner.title.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        if (banner.subtitle && banner.subtitle.toLowerCase().includes(searchLower)) {
          return true;
        }
        
        return false;
      })
      .sort((a, b) => {
        const fieldA = a[sortField as keyof FirebaseBanner];
        const fieldB = b[sortField as keyof FirebaseBanner];

        if (fieldA === undefined || fieldB === undefined) return 0;

        if (typeof fieldA === 'string' && typeof fieldB === 'string') {
          return sortOrder === 'asc'
            ? fieldA.localeCompare(fieldB)
            : fieldB.localeCompare(fieldA);
        }
        
        const numA = Number(fieldA);
        const numB = Number(fieldB);
        
        if (isNaN(numA) || isNaN(numB)) return 0;
        
        return sortOrder === 'asc' ? numA - numB : numB - numA;
      });
  }, [banners, filterPage, searchTerm, sortField, sortOrder]);

  // Handle form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'order') {
      const numValue = parseInt(value) || 0;
      setBannerForm(prev => ({ ...prev, [name]: numValue }));
    } else {
      setBannerForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field if it exists
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Check if all required fields are filled to clear the general error message
    if (name === 'page' && value) {
      setSubmitStatus(null);
      
      // Check if a banner already exists for this page
      if (!isEditing) {
        const existingBannersForPage = banners.filter(banner => banner.page === value);
        if (existingBannersForPage.length > 0) {
          const existingBanner = existingBannersForPage[0];
          const pageLabel = availablePages.find(p => p.value === value)?.label || value;
          
          // Show a notice that we'll update the existing banner
          setSubmitStatus({
            type: 'info',
            message: `A banner already exists for ${pageLabel}. It will be updated with your changes.`
          });
          
          setBannerForm(prev => ({ 
            ...prev, 
            imageUrl: existingBanner.imageUrl,
            // Keep these values for consistency
            title: existingBanner.title || '',
            subtitle: existingBanner.subtitle || '',
            textColor: existingBanner.textColor || '#ffffff',
            order: existingBanner.order || 1
          }));
        }
      }
    }
  };

  // Handle file selection for banner image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormErrors(prev => ({ ...prev, imageUrl: '' }));
    }
  };

  // Handle banner image upload
  const handleUploadImage = async () => {
    if (!selectedFile) {
      setFormErrors(prev => ({ ...prev, imageUrl: 'Please select an image to upload' }));
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate progress (in a real app, you'd use Firebase's upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Upload to Firebase Storage
      const imageUrl = await uploadBannerImage(selectedFile);
      
      // Update form with the new image URL
      setBannerForm(prev => ({ ...prev, imageUrl }));
      
      // Clear progress interval and set to 100%
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error uploading banner image:', error);
      setSubmitStatus({
        type: 'error',
        message: 'Failed to upload image. Please try again.'
      });
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitStatus(null);
    
    const newErrors: FormErrors = {};
    
    if (!bannerForm.page) newErrors.page = 'Page is required';
    if (!bannerForm.imageUrl) newErrors.imageUrl = 'Banner image is required';
    
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }
    
    try {
      // Create a complete banner object with default values for fields not in the UI
      const completeFormData = {
        page: bannerForm.page,
        imageUrl: bannerForm.imageUrl,
        title: bannerForm.title || '',
        subtitle: bannerForm.subtitle || '',
        textColor: bannerForm.textColor || '#ffffff',
        order: bannerForm.order || 1
      };
      
      // Check if a banner already exists for this page
      const existingBannersForPage = banners.filter(banner => banner.page === bannerForm.page);
      const pageLabel = availablePages.find(p => p.value === bannerForm.page)?.label || bannerForm.page;
      
      if (isEditing && editingBannerId) {
        // Normal edit case - update the banner being edited
        await updateExistingBanner(editingBannerId, completeFormData);
        setSubmitStatus({
          type: 'success',
          message: `Banner for ${pageLabel} updated successfully`
        });
      } else if (existingBannersForPage.length > 0) {
        // If adding a new banner but one already exists for this page, update the existing one
        await updateExistingBanner(existingBannersForPage[0].id, completeFormData);
        setSubmitStatus({
          type: 'success',
          message: `Banner for ${pageLabel} updated successfully`
        });
      } else {
        // No existing banner for this page, create a new one
        await addNewBanner(completeFormData);
        setSubmitStatus({
          type: 'success',
          message: `Banner for ${pageLabel} added successfully`
        });
      }
      
      resetForm();
      // Refresh the banners list to show the updated data
      refreshBanners();
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: (error as Error).message || 'An error occurred while saving the banner'
      });
    }
  };

  // Reset form to default values
  const resetForm = () => {
    setBannerForm(defaultBannerForm);
    setEditingBannerId(null);
    setIsAdding(false);
    setIsEditing(false);
    setFormErrors({});
    setSubmitStatus(null);
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle edit banner button click
  const handleEditBanner = (banner: FirebaseBanner) => {
    setIsAdding(true);
    setIsEditing(true);
    setEditingBannerId(banner.id);
    
    // Set form values from the banner
    setBannerForm({
      page: banner.page,
      imageUrl: banner.imageUrl,
      // Keep these values but they're not shown in the UI
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      textColor: banner.textColor || '#ffffff',
      order: banner.order || 1
    });
    
    // Scroll to form
    const scrollTimer = setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }, 100);
    
    return () => clearTimeout(scrollTimer);
  };

  // Handle delete banner button click
  const handleDeleteBanner = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await removeBanner(id);
        
        if (editingBannerId === id) {
          resetForm();
        }
        
        // If this was the banner being previewed, close the preview
        if (previewBanner && previewBanner.id === id) {
          setPreviewBanner(null);
        }
        
        showActionMessage('Banner deleted successfully', 'success');
      } catch (error) {
        showActionMessage((error as Error).message || 'Failed to delete banner', 'error');
      }
    }
  };
  
  // Show action messages with auto-dismiss
  const showActionMessage = (text: string, type: 'success' | 'error') => {
    setSubmitStatus({ type, message: text });
    
    const messageTimer = setTimeout(() => {
      setSubmitStatus(null);
    }, 3000);
    
    // Store the timer ID so we can clear it if component unmounts
    return () => clearTimeout(messageTimer);
  };

  // Handle sort field click
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Render sort icon with client-only to prevent hydration mismatch
  const SortIcon = ({ field }: { field: string }) => (
    <ClientOnly>
      <span className={styles.sortIcon}>
        {sortField === field 
          ? (sortOrder === 'asc' ? <FaSortUp /> : <FaSortDown />)
          : <FaSort />
        }
      </span>
    </ClientOnly>
  );

  // Banner card component for mobile view
  const BannerCard = ({ banner }: { banner: FirebaseBanner }) => {
    const pageLabel = availablePages.find(p => p.value === banner.page)?.label || banner.page;
    
    return (
      <div className={styles.bannerCard}>
        <div className={styles.bannerCardHeader}>
          <span className={styles.bannerCardTitle}>{pageLabel}</span>
        </div>
        
        {banner.imageUrl ? (
          <img 
            src={banner.imageUrl} 
            alt={`Banner for ${pageLabel}`} 
            className={styles.bannerCardImage}
          />
        ) : (
          <div className={styles.noImage} style={{ height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            No Image
          </div>
        )}
        
        <div className={styles.bannerCardActions}>
          <button 
            onClick={() => handleEditBanner(banner)}
            className={`${styles.adminActionBtn} ${styles.edit}`}
          >
            <FaEdit /> Edit
          </button>
          <button 
            onClick={() => handleDeleteBanner(banner.id)}
            className={styles.adminActionBtn}
          >
            <FaTrash /> Delete
          </button>
          <button 
            onClick={() => setPreviewBanner(banner)}
            className={`${styles.adminActionBtn} ${styles.edit}`}
          >
            <FaEye /> Preview
          </button>
        </div>
      </div>
    );
  };

  // If not admin, show login message
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className={styles.adminPanel}>
        <div className="container">
          <h1>Admin Access Required</h1>
          <p>You need to be logged in as an administrator to view this page.</p>
          {user ? (
            <p>Your account does not have administrator privileges.</p>
          ) : (
            <p>Please <Link href="/login">login</Link> to continue.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.adminPanelContainer}>
      <div className={styles.adminHeader}>
        <h1 className={styles.adminPanelTitle}>Banner Management</h1>
        <button 
          className={styles.addBannerBtn}
          onClick={() => setIsAdding(true)}
        >
          <FaPlus /> Add Banner
        </button>
      </div>
        
      <div className={styles.adminNav}>
        <Link href="/admin/orders">Dashboard</Link>
        <Link href="/admin/products">Products</Link>
        <Link href="/admin/banners" className={styles.active}>Banners</Link>
      </div>
        
      {/* Banner form section */}
      <div className={styles.bannerContainer}>
        <h2>{isEditing ? 'Edit Banner' : 'Add New Banner'}</h2>
          
        {/* Display success/error message */}
        <ClientOnly>
          {submitStatus && (
            <div className={`${styles.actionMessage} ${styles[submitStatus.type]}`}>
              {submitStatus.message}
            </div>
          )}
        </ClientOnly>
          
        {/* Add/Edit form */}
        <ClientOnly>
          {isAdding ? (
            <form ref={formRef} onSubmit={handleSubmit} className={styles.adminForm}>
              <div className={styles.formGroup}>
                <label htmlFor="page">Page *</label>
                <select 
                  id="page"
                  name="page"
                  value={bannerForm.page}
                  onChange={handleChange}
                  className={formErrors.page ? styles.errorInput : ''}
                >
                  {availablePages.map(page => (
                    <option key={page.value} value={page.value}>{page.label}</option>
                  ))}
                </select>
                {formErrors.page && <div className={styles.errorText}>{formErrors.page}</div>}
              </div>
              
              <div className={styles.formGroup}>
                <label>Banner Image *</label>
                <div className={styles.uploadContainer}>
                  <input
                    type="file"
                    accept="image/*"
                    id="bannerImage"
                    ref={fileInputRef}
                    className={styles.fileInput}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="bannerImage" className={styles.uploadButton}>
                    <FaImage /> Select Image
                  </label>
                  <button
                    type="button"
                    className={`${styles.uploadButton} ${!selectedFile || isUploading ? styles.disabled : ''}`}
                    onClick={handleUploadImage}
                    disabled={!selectedFile || isUploading}
                  >
                    <FaUpload /> {isUploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
                
                {selectedFile && (
                  <div className={styles.selectedFile}>
                    Selected: {selectedFile.name}
                  </div>
                )}
                
                {uploadProgress > 0 && (
                  <div className={styles.progressContainer}>
                    <div 
                      className={styles.progressBar} 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                )}
                
                {bannerForm.imageUrl && (
                  <div className={styles.currentImagePreview}>
                    <img 
                      src={bannerForm.imageUrl} 
                      alt="Current Banner" 
                      className={styles.previewImage}
                    />
                  </div>
                )}
                
                {formErrors.imageUrl && <div className={styles.errorText}>{formErrors.imageUrl}</div>}
              </div>
                
              <div className={styles.formActions}>
                <button 
                  type="submit" 
                  className={styles.submitButton}
                  disabled={isUploading}
                >
                  <FaSave /> {isEditing ? 'Update Banner' : 'Add Banner'}
                </button>
                <button 
                  type="button" 
                  className={styles.cancelButton}
                  onClick={resetForm}
                >
                  <FaTimes /> Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.emptyFormState}>
              Click "Add Banner" to create a new banner for your website.
            </div>
          )}
        </ClientOnly>
      </div>
        
      {/* Banner list */}
      <div className={styles.formContainer}>
        <div className={styles.horizontalControls}>
          <div className={styles.searchSection}>
            <div className={styles.searchBox}>
              <FaSearch className={styles.searchIcon} />
              <input 
                type="text"
                placeholder="Search banners..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select 
              value={filterPage}
              onChange={e => setFilterPage(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Pages</option>
              {availablePages.map(page => (
                <option key={page.value} value={page.value}>{page.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.statsSection}>
            <h2>Banners ({filteredBanners.length})</h2>
          </div>

          <div className={styles.actionSection}>
            <button 
              className={styles.addBannerBtn}
              onClick={() => {
                setIsAdding(true);
                // Scroll to top when adding a banner
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth'
                });
              }}
            >
              <FaPlus /> Add Banner
            </button>
          </div>
        </div>
          
        {/* Loading and error states */}
        <ClientOnly>
          {loading ? (
            <div className={styles.loadingState}>Loading banners...</div>
          ) : error ? (
            <div className={styles.errorState}>{error}</div>
          ) : filteredBanners.length === 0 ? (
            <div className={styles.emptyState}>No banners found</div>
          ) : (
            <>
              {/* Desktop table view */}
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th className={styles.imageCell}>Image</th>
                    <th 
                      onClick={() => handleSort('page')} 
                      className={styles.sortableHeader}
                    >
                      Page <SortIcon field="page" />
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map(banner => (
                    <tr key={banner.id}>
                      <td className={styles.imageCell}>
                        {banner.imageUrl ? (
                          <img src={banner.imageUrl} alt="Banner" className={styles.productThumb} />
                        ) : (
                          <div className={styles.noImage}>No Image</div>
                        )}
                      </td>
                      <td>
                        {availablePages.find(p => p.value === banner.page)?.label || banner.page}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            onClick={() => handleEditBanner(banner)}
                            className={`${styles.adminActionBtn} ${styles.edit}`}
                          >
                            <FaEdit /> Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteBanner(banner.id)}
                            className={styles.adminActionBtn}
                          >
                            <FaTrash /> Delete
                          </button>
                          <button 
                            onClick={() => setPreviewBanner(banner)}
                            className={`${styles.adminActionBtn} ${styles.edit}`}
                          >
                            <FaEye /> Preview
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Mobile card view */}
              <div className={styles.mobileCardView}>
                {filteredBanners.map(banner => (
                  <BannerCard key={banner.id} banner={banner} />
                ))}
              </div>
            </>
          )}
        </ClientOnly>
      </div>
      
      {/* Banner Preview Modal */}
      {previewBanner && (
        <div className={styles.modalOverlay} onClick={() => setPreviewBanner(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Banner Preview</h2>
              <button 
                className={styles.closeButton}
                onClick={() => setPreviewBanner(null)}
                aria-label="Close preview"
              >
                <FaTimes />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div style={{ position: 'relative', width: '100%', height: '300px' }}>
                {previewBanner.imageUrl ? (
                  <img 
                    src={previewBanner.imageUrl} 
                    alt="Banner Preview" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      console.error('Failed to load banner image');
                      // Replace with fallback image or show error state
                      e.currentTarget.src = '/images/banners/banner-1.svg';
                    }}
                  />
                ) : (
                  <div style={{ 
                    width: '100%', 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280'
                  }}>
                    <div>No Image Available</div>
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '20px' }}>
                <div style={{ marginBottom: '10px' }}>
                  <strong>Page:</strong> {availablePages.find(p => p.value === previewBanner.page)?.label || previewBanner.page}
                </div>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button 
                className={styles.cancelButton}
                onClick={() => setPreviewBanner(null)}
              >
                Close
              </button>
              <button 
                className={`${styles.adminActionBtn} ${styles.edit}`}
                onClick={() => {
                  handleEditBanner(previewBanner);
                  setPreviewBanner(null);
                }}
              >
                <FaEdit /> Edit This Banner
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mobile Action Bar */}
      <div className={styles.mobileActionBar}>
        <div className={styles.actionButtons}>
          <button 
            className={`${styles.adminActionBtn} ${styles.edit}`}
            onClick={() => {
              resetForm();
              setIsAdding(!isAdding);
              if (!isAdding) {
                // Scroll to top when adding a banner
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
                onClick={() => {
                  const select = document.querySelector(`.${styles.filterSelect}`) as HTMLSelectElement;
                  if (select) select.focus();
                }}
              >
                <FaSearch /> Filter
              </button>
              {filteredBanners.length > 0 && (
                <button 
                  className={styles.adminActionBtn}
                  onClick={() => setPreviewBanner(filteredBanners[0])}
                >
                  <FaEye /> Preview
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 