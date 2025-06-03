import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product } from '../data/products';
import { Category } from '../utils/localStorage';
import * as firestoreAPI from '../utils/firestore';

interface ProductContextType {
  products: Product[];
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  loading: boolean;
  error: string | null;
  addNewProduct: (product: Omit<Product, 'id'>) => Promise<Product>;
  updateExistingProduct: (id: string, product: Partial<Product>) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
  refreshProducts: () => Promise<void>;
  getProductsInCategory: (category: string) => Product[];
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] = useState<Record<string, Product[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Organize products by category
  const organizeProductsByCategory = useCallback((allProducts: Product[]) => {
    const byCategory: Record<string, Product[]> = {};
    
    // Log the organization process
    console.log(`Organizing ${allProducts.length} products into categories...`);
    
    allProducts.forEach(product => {
      // Skip products without category
      if (!product.category) {
        console.log(`Skipping product ${product.id} - ${product.name}: missing category`);
        return;
      }
      
      console.log(`Processing product ${product.id} - ${product.name}: Category=${product.category}, Subcategory=${product.subcategory || 'none'}`);
      
      // Add to main category (normalized to lowercase)
      const mainCategory = product.category.toLowerCase();
      if (!byCategory[mainCategory]) {
        byCategory[mainCategory] = [];
      }
      byCategory[mainCategory].push(product);
      
      // Also add to subcategory if it exists (normalized to lowercase)
      if (product.subcategory) {
        const subcategory = product.subcategory.toLowerCase();
        if (!byCategory[subcategory]) {
          byCategory[subcategory] = [];
        }
        
        // Check if product is already in this subcategory to avoid duplicates
        if (!byCategory[subcategory].some(p => p.id === product.id)) {
          byCategory[subcategory].push(product);
        }
        
        // Also add to combined category-subcategory
        const combinedCategory = `${mainCategory}-${subcategory}`;
        if (!byCategory[combinedCategory]) {
          byCategory[combinedCategory] = [];
        }
        
        // Check if product is already in this combined category to avoid duplicates
        if (!byCategory[combinedCategory].some(p => p.id === product.id)) {
          byCategory[combinedCategory].push(product);
        }
      }
      
      // Add to tags-based categories if tags exist
      if (Array.isArray(product.tags) && product.tags.length > 0) {
        product.tags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          if (!byCategory[normalizedTag]) {
            byCategory[normalizedTag] = [];
          }
          
          // Check if product is already in this tag category to avoid duplicates
          if (!byCategory[normalizedTag].some(p => p.id === product.id)) {
            byCategory[normalizedTag].push(product);
          }
        });
      }
    });
    
    // Log organized categories
    console.log(`Organized ${allProducts.length} products into ${Object.keys(byCategory).length} categories`);
    Object.keys(byCategory).forEach(category => {
      console.log(`Category '${category}' has ${byCategory[category].length} products`);
    });
    
    setProductsByCategory(byCategory);
  }, []);

  // Fetch all products from Firestore
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear product cache to ensure fresh data
      await firestoreAPI.clearProductCache();
      
      // Get data from Firestore
      console.log('Fetching products from Firestore in ProductContext');
      const fetchedProducts = await firestoreAPI.getAllProducts();
      console.log(`Fetched ${fetchedProducts.length} products from Firestore`);
      
      if (fetchedProducts.length === 0) {
        console.warn("Warning: Received empty products array from Firestore");
      }
      
      // Get categories from Firestore
      // This is handled automatically by the Firestore API
      
      setProducts(fetchedProducts);
      organizeProductsByCategory(fetchedProducts);
      
    } catch (err: any) {
      console.error('Error fetching products:', err);
      
      // Try once more after a short delay
      try {
        console.log('Retrying product fetch after error...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const retryProducts = await firestoreAPI.getAllProducts();
        console.log(`Retry fetched ${retryProducts.length} products`);
        
        setProducts(retryProducts);
        organizeProductsByCategory(retryProducts);
        setError(null); // Clear error if retry succeeds
      } catch (retryErr: any) {
        console.error('Retry also failed:', retryErr);
        setError(retryErr.message || 'Failed to load products. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [organizeProductsByCategory]);

  // Load products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get products in a specific category
  const getProductsInCategory = useCallback((category: string): Product[] => {
    return productsByCategory[category] || [];
  }, [productsByCategory]);

  // Add a new product
  const addNewProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
    try {
      setError(null);
      
      // Ensure product has required fields
      if (!product.category) {
        throw new Error('Product category is required');
      }
      
      console.log('Adding new product:', product);
      
      // Add product to Firestore
      const newProduct = await firestoreAPI.addProduct(product);
      console.log('Product added with ID:', newProduct.id);
      
      // Refresh products from Firestore to ensure everything is up to date
      await fetchProducts();
      
      return newProduct;
    } catch (err: any) {
      console.error('Error adding product:', err);
      setError(err.message || 'Failed to add product');
      throw err;
    }
  };

  // Update an existing product
  const updateExistingProduct = async (id: string, updates: Partial<Product>): Promise<void> => {
    try {
      setError(null);
      
      // Find the existing product to check for category changes
      const existingProduct = products.find(p => p.id === id);
      if (!existingProduct) {
        throw new Error('Product not found');
      }
      
      console.log(`Updating product ${id} with:`, updates);
      
      // Update in Firestore
      await firestoreAPI.updateProduct(id, updates);
      console.log(`Product ${id} updated successfully`);
      
      // Refresh products from Firestore to ensure everything is up to date
      await fetchProducts();
      
    } catch (err: any) {
      console.error('Error updating product:', err);
      setError(err.message || 'Failed to update product');
      throw err;
    }
  };

  // Remove a product
  const removeProduct = async (id: string): Promise<void> => {
    try {
      setError(null);
      
      // Find the product to get its category
      const productToRemove = products.find(p => p.id === id);
      if (!productToRemove) {
        throw new Error('Product not found');
      }
      
      console.log(`Deleting product ${id}`);
      
      // Delete from Firestore
      await firestoreAPI.deleteProduct(id);
      console.log(`Product ${id} deleted successfully`);
      
      // Refresh products from Firestore to ensure everything is up to date
      await fetchProducts();
      
    } catch (err: any) {
      console.error('Error removing product:', err);
      setError(err.message || 'Failed to delete product');
      throw err;
    }
  };

  // Upload an image to Firebase Storage
  const uploadImage = async (file: File): Promise<string> => {
    try {
      setError(null);
      return await firestoreAPI.uploadProductImage(file);
    } catch (err: any) {
      console.error('Error uploading image:', err);
      setError(err.message || 'Failed to upload image');
      throw err;
    }
  };

  // Manual refresh function
  const refreshProducts = async (): Promise<void> => {
    await fetchProducts();
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        categories,
        productsByCategory,
        loading,
        error,
        addNewProduct,
        updateExistingProduct,
        removeProduct,
        uploadImage,
        refreshProducts,
        getProductsInCategory
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}; 