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
    
    allProducts.forEach(product => {
      if (!product.category) return;
      
      if (!byCategory[product.category]) {
        byCategory[product.category] = [];
      }
      
      byCategory[product.category].push(product);
    });
    
    setProductsByCategory(byCategory);
  }, []);

  // Fetch all products from Firestore
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get data from Firestore
      const fetchedProducts = await firestoreAPI.getAllProducts();
      
      // Get categories from Firestore
      // This is handled automatically by the Firestore API
      
      setProducts(fetchedProducts);
      organizeProductsByCategory(fetchedProducts);
      
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message || 'Failed to load products. Please try again later.');
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
      
      // Add product to Firestore
      const newProduct = await firestoreAPI.addProduct(product);
      
      // Update local state
      setProducts(prevProducts => [...prevProducts, newProduct]);
      
      // Update category cache
      setProductsByCategory(prev => {
        const updated = { ...prev };
        const category = product.category as string;
        
        if (!updated[category]) {
          updated[category] = [];
        }
        updated[category] = [...updated[category], newProduct];
        return updated;
      });
      
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
      
      // Update in Firestore
      await firestoreAPI.updateProduct(id, updates);
      
      // Get the updated product
      const updatedProduct = { ...existingProduct, ...updates };
      
      // Update local state
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === id ? updatedProduct : p)
      );
      
      // Handle category change if needed
      if (updates.category && existingProduct.category !== updates.category) {
        // Refetch products to ensure they're up to date
        await fetchProducts();
      } else {
        // Just update the product in its existing category
        setProductsByCategory(prev => {
          const category = existingProduct.category;
          if (category && prev[category]) {
            return {
              ...prev,
              [category]: prev[category].map(p => 
                p.id === id ? updatedProduct : p
              )
            };
          }
          return prev;
        });
      }
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
      
      // Delete from Firestore
      await firestoreAPI.deleteProduct(id);
      
      // Update local state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      
      // Update category cache
      if (productToRemove.category) {
        setProductsByCategory(prev => {
          const updated = { ...prev };
          if (updated[productToRemove.category]) {
            updated[productToRemove.category] = updated[productToRemove.category].filter(
              p => p.id !== id
            );
            
            // Remove category array if empty
            if (updated[productToRemove.category].length === 0) {
              delete updated[productToRemove.category];
            }
          }
          return updated;
        });
      }
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