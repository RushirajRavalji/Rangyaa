import { Product } from '../data/products';

// Constants for localStorage keys
const STORAGE_KEYS = {
  PRODUCTS: 'rangya_products',
  CATEGORIES: 'rangya_categories',
  BANNERS: 'rangya_banners',
  DEMO_DATA_LOADED: 'rangya_demo_data_loaded'
};

// Type definitions
export interface Category {
  id: string;
  name: string;
  count: number;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  id: string;
  page: string;
  imageUrl: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Helper to generate unique IDs
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

// Initialize localStorage without loading sample products
export const initializeLocalStorage = (): void => {
  try {
    console.log('Initializing localStorage');
  } catch (error) {
    console.error('Error initializing localStorage:', error);
  }
};

// Get all products from localStorage
export const getAllProducts = (): Product[] => {
  try {
    const productsJson = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (!productsJson) return [];
    return JSON.parse(productsJson);
  } catch (error) {
    console.error('Error getting products from localStorage:', error);
    return [];
  }
};

// Get products by category
export const getProductsByCategory = (category: string): Product[] => {
  try {
    const products = getAllProducts();
    return products.filter(product => product.category === category);
  } catch (error) {
    console.error(`Error getting ${category} products from localStorage:`, error);
    return [];
  }
};

// Get most recent products (for New Arrivals)
export const getNewArrivals = (limit: number = 8): Product[] => {
  try {
    const products = getAllProducts();
    
    // Sort products by createdAt timestamp (newest first)
    return products
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      })
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting new arrivals:', error);
    return [];
  }
};

// Get product by ID
export const getProductById = (id: string): Product | null => {
  try {
    const products = getAllProducts();
    const product = products.find(p => p.id === id);
    return product || null;
  } catch (error) {
    console.error('Error getting product from localStorage:', error);
    return null;
  }
};

// Add a new product
export const addProduct = (product: Omit<Product, 'id'>): Product => {
  try {
    // Validate product data
    if (!product.name || !product.price || !product.category) {
      throw new Error('Missing required product fields');
    }

    // Generate ID and timestamps
    const id = generateId();
    const timestamp = new Date().toISOString();
    
    const newProduct: Product = {
      ...product,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Save to localStorage
    const products = getAllProducts();
    const updatedProducts = [...products, newProduct];
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updatedProducts));
    
    // Update category counts
    updateCategoryCount(product.category, 1);
    
    return newProduct;
  } catch (error) {
    console.error('Error adding product to localStorage:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = (id: string, updates: Partial<Product>): void => {
  try {
    const products = getAllProducts();
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }
    
    const oldProduct = products[productIndex];
    const updatedProduct = {
      ...oldProduct,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Check if category changed
    if (updates.category && oldProduct.category !== updates.category) {
      // Update category counts
      updateCategoryCount(oldProduct.category, -1);
      updateCategoryCount(updates.category, 1);
    }
    
    // Save to localStorage
    products[productIndex] = updatedProduct;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  } catch (error) {
    console.error('Error updating product in localStorage:', error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = (id: string): void => {
  try {
    const products = getAllProducts();
    const product = products.find(p => p.id === id);
    
    if (!product) {
      throw new Error('Product not found');
    }
    
    // Update category counts
    updateCategoryCount(product.category, -1);
    
    // Remove product
    const filteredProducts = products.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(filteredProducts));
  } catch (error) {
    console.error('Error deleting product from localStorage:', error);
    throw error;
  }
};

// Get all categories
export const getAllCategories = (): Category[] => {
  try {
    const categoriesJson = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    if (!categoriesJson) return [];
    return JSON.parse(categoriesJson);
  } catch (error) {
    console.error('Error getting categories from localStorage:', error);
    return [];
  }
};

// Update category count
const updateCategoryCount = (categoryId: string, change: number): void => {
  try {
    const categories = getAllCategories();
    const categoryIndex = categories.findIndex(c => c.id === categoryId);
    const timestamp = new Date().toISOString();
    
    if (categoryIndex >= 0) {
      // Update existing category
      const category = categories[categoryIndex];
      const newCount = category.count + change;
      
      if (newCount <= 0) {
        // Remove category if count is zero or negative
        categories.splice(categoryIndex, 1);
      } else {
        // Update count
        categories[categoryIndex] = {
          ...category,
          count: newCount,
          updatedAt: timestamp
        };
      }
    } else if (change > 0) {
      // Add new category
      categories.push({
        id: categoryId,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        count: change,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  } catch (error) {
    console.error('Error updating category count in localStorage:', error);
  }
};

// Banner Management Functions

// Get all banners
export const getAllBanners = (): Banner[] => {
  try {
    const bannersJson = localStorage.getItem(STORAGE_KEYS.BANNERS);
    if (!bannersJson) return [];
    return JSON.parse(bannersJson);
  } catch (error) {
    console.error('Error getting banners from localStorage:', error);
    return [];
  }
};

// Get banners for a specific page
export const getBannersByPage = (page: string): Banner[] => {
  try {
    const banners = getAllBanners();
    return banners
      .filter(banner => banner.page === page)
      .sort((a, b) => a.order - b.order); // Sort by order field
  } catch (error) {
    console.error(`Error getting banners for page ${page}:`, error);
    return [];
  }
};

// Add a new banner
export const addBanner = (banner: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Banner => {
  try {
    // Validate banner data
    if (!banner.page || !banner.imageUrl) {
      throw new Error('Missing required banner fields');
    }

    // Generate ID and timestamps
    const id = generateId();
    const timestamp = new Date().toISOString();
    
    // Ensure order is set
    if (banner.order === undefined) {
      banner.order = 0;
    }
    
    const newBanner: Banner = {
      ...banner,
      id,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    // Save to localStorage
    const existingBanners = getAllBanners();
    const updatedBanners = [...existingBanners, newBanner];
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(updatedBanners));
    
    return newBanner;
  } catch (error) {
    console.error('Error adding banner to localStorage:', error);
    throw error;
  }
};

// Update a banner
export const updateBanner = (id: string, updates: Partial<Banner>): void => {
  try {
    const banners = getAllBanners();
    const bannerIndex = banners.findIndex(b => b.id === id);
    
    if (bannerIndex === -1) {
      throw new Error('Banner not found');
    }
    
    const oldBanner = banners[bannerIndex];
    const updatedBanner = {
      ...oldBanner,
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    banners[bannerIndex] = updatedBanner;
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  } catch (error) {
    console.error('Error updating banner in localStorage:', error);
    throw error;
  }
};

// Delete a banner
export const deleteBanner = (id: string): void => {
  try {
    const banners = getAllBanners();
    const bannerToDelete = banners.find(b => b.id === id);
    
    if (!bannerToDelete) {
      throw new Error('Banner not found');
    }
    
    const filteredBanners = banners.filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(filteredBanners));
  } catch (error) {
    console.error('Error deleting banner from localStorage:', error);
    throw error;
  }
};

// Enhanced image upload function that returns a data URL
export const uploadProductImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error reading image file'));
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      reject(error);
    }
  });
};

// Method to clear all products
export const clearAllProducts = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    console.log('All products and categories have been cleared');
  } catch (error) {
    console.error('Error clearing products:', error);
  }
};

// Get featured products
export const getFeaturedProducts = (limit: number = 8): Product[] => {
  try {
    const products = getAllProducts();
    return products
      .filter(product => product.featured)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting featured products:', error);
    return [];
  }
}; 