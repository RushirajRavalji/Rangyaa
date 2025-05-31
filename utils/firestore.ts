import { app } from './firebase';
import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, runTransaction, serverTimestamp, DocumentReference, limit, orderBy, startAfter, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { Product } from '../data/products';

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Collection references
const productsCollection = collection(db, 'products');
const categoriesCollection = collection(db, 'categories');

// Cache for products
const productCache: {
  all: Product[] | null;
  byId: Record<string, Product>;
  byCategory: Record<string, Product[]>;
  lastFetched: number;
} = {
  all: null,
  byId: {},
  byCategory: {},
  lastFetched: 0
};

// Cache expiration time (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Validate product data before saving
const validateProduct = (product: Partial<Product>): string | null => {
  if (!product.name || typeof product.name !== 'string') {
    return 'Product name is required';
  }
  
  if (!product.price || isNaN(Number(product.price))) {
    return 'Valid product price is required';
  }
  
  if (!product.category || typeof product.category !== 'string') {
    return 'Product category is required';
  }
  
  if (!product.subcategory || typeof product.subcategory !== 'string') {
    return 'Product subcategory is required';
  }
  
  if (!product.image || typeof product.image !== 'string') {
    return 'Product image is required';
  }
  
  return null; // No errors
};

// Clean product data for Firestore
const cleanProductData = (product: Record<string, any>): Record<string, any> => {
  const cleanedProduct: Record<string, any> = {};
  
  Object.entries(product).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      // Handle specific field types
      if (key === 'price' || key === 'originalPrice' || key === 'stock') {
        cleanedProduct[key] = Number(value);
      } else if (key === 'sizes' && typeof value === 'string') {
        cleanedProduct[key] = value.split(',').map((s: string) => s.trim()).filter(Boolean);
      } else if (key === 'featured' || key === 'new') {
        cleanedProduct[key] = value === true || value === 'true';
      } else if (key === 'category' || key === 'subcategory') {
        // Normalize categories to lowercase
        cleanedProduct[key] = String(value).toLowerCase().trim();
      } else {
        cleanedProduct[key] = value;
      }
    }
  });
  
  // Ensure there are tags for category and subcategory
  if (!cleanedProduct.tags) {
    cleanedProduct.tags = [];
  }
  
  // Add category and subcategory to tags if they don't exist
  if (cleanedProduct.category && !cleanedProduct.tags.includes(cleanedProduct.category)) {
    cleanedProduct.tags.push(cleanedProduct.category);
  }
  
  if (cleanedProduct.subcategory && !cleanedProduct.tags.includes(cleanedProduct.subcategory)) {
    cleanedProduct.tags.push(cleanedProduct.subcategory);
  }
  
  // Add combined tag (category-subcategory)
  if (cleanedProduct.category && cleanedProduct.subcategory) {
    const combinedTag = `${cleanedProduct.category}-${cleanedProduct.subcategory}`;
    if (!cleanedProduct.tags.includes(combinedTag)) {
      cleanedProduct.tags.push(combinedTag);
    }
  }
  
  // Add timestamps
  if (!cleanedProduct.createdAt) {
    cleanedProduct.createdAt = serverTimestamp();
  }
  cleanedProduct.updatedAt = serverTimestamp();
  
  return cleanedProduct;
};

// Check if cache is valid
const isCacheValid = (): boolean => {
  return (
    productCache.all !== null &&
    Date.now() - productCache.lastFetched < CACHE_EXPIRATION
  );
};

// Get all products with pagination and caching
export const getAllProducts = async (pageSize: number = 0): Promise<Product[]> => {
  try {
    // If cache is valid and we're not paginating, return cached products
    if (isCacheValid() && pageSize === 0 && productCache.all) {
      console.log(`Returning ${productCache.all.length} products from cache`);
      return productCache.all;
    }
    
    console.log('Cache invalid or empty, fetching products from Firestore...');
    
    let productsQuery = query(productsCollection, orderBy('createdAt', 'desc'));
    
    // Apply pagination if pageSize is specified
    if (pageSize > 0) {
      productsQuery = query(productsQuery, limit(pageSize));
    }
    
    console.log('Executing Firestore query...');
    const snapshot = await getDocs(productsQuery);
    console.log(`Raw Firestore query returned ${snapshot.docs.length} documents`);
    
    const products = snapshot.docs.map(doc => {
      const data = doc.data();
      // Log each product for debugging
      console.log(`Processing product: ${doc.id} - ${data.name || 'Unnamed product'}`);
      return {
        id: doc.id,
        ...data
      } as Product;
    });
    
    // Update cache if we're getting all products
    if (pageSize === 0) {
      productCache.all = products;
      
      // Update byId and byCategory caches
      products.forEach(product => {
        productCache.byId[product.id] = product;
        
        if (product.category) {
          if (!productCache.byCategory[product.category]) {
            productCache.byCategory[product.category] = [];
          }
          productCache.byCategory[product.category].push(product);
        }
      });
      
      productCache.lastFetched = Date.now();
    }
    
    console.log(`Successfully processed and returning ${products.length} products from Firestore`);
    return products;
  } catch (error) {
    console.error('Error getting products from Firestore:', error);
    throw new Error('Failed to fetch products');
  }
};

// Get next page of products
export const getNextProductsPage = async (
  lastVisible: QueryDocumentSnapshot,
  pageSize: number = 20
): Promise<Product[]> => {
  try {
    const productsQuery = query(
      productsCollection,
      orderBy('createdAt', 'desc'),
      startAfter(lastVisible),
      limit(pageSize)
    );
    
    const snapshot = await getDocs(productsQuery);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    
    // Update cache for these products
    products.forEach(product => {
      productCache.byId[product.id] = product;
      
      if (product.category) {
        if (!productCache.byCategory[product.category]) {
          productCache.byCategory[product.category] = [];
        }
        
        // Check if product already exists in category cache
        const existingIndex = productCache.byCategory[product.category].findIndex(
          p => p.id === product.id
        );
        
        if (existingIndex >= 0) {
          productCache.byCategory[product.category][existingIndex] = product;
        } else {
          productCache.byCategory[product.category].push(product);
        }
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error getting next page of products:', error);
    throw new Error('Failed to fetch more products');
  }
};

// Get products by category with caching
export const getProductsByCategory = async (category: string): Promise<Product[]> => {
  try {
    // Check if we have this category in cache and it's still valid
    if (
      isCacheValid() &&
      productCache.byCategory[category] &&
      productCache.byCategory[category].length > 0
    ) {
      console.log(`Returning ${category} products from cache`);
      return productCache.byCategory[category];
    }
    
    console.log(`Fetching ${category} products from Firestore`);
    const q = query(productsCollection, where('category', '==', category));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    
    // Update cache
    productCache.byCategory[category] = products;
    
    // Also update byId cache
    products.forEach(product => {
      productCache.byId[product.id] = product;
    });
    
    return products;
  } catch (error) {
    console.error(`Error getting ${category} products:`, error);
    throw new Error(`Failed to fetch ${category} products`);
  }
};

// Get featured products with caching
export const getFeaturedProducts = async (limitCount: number = 8): Promise<Product[]> => {
  try {
    // If we have all products cached, filter them
    if (isCacheValid() && productCache.all) {
      const featured = productCache.all.filter(p => p.featured).slice(0, limitCount);
      if (featured.length > 0) {
        console.log('Returning featured products from cache');
        return featured;
      }
    }
    
    console.log('Fetching featured products from Firestore');
    const q = query(
      productsCollection,
      where('featured', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    
    // Update byId cache
    products.forEach(product => {
      productCache.byId[product.id] = product;
      
      // Update category cache if needed
      if (product.category) {
        if (!productCache.byCategory[product.category]) {
          productCache.byCategory[product.category] = [];
        }
        
        // Check if product already exists in category cache
        const existingIndex = productCache.byCategory[product.category].findIndex(
          p => p.id === product.id
        );
        
        if (existingIndex >= 0) {
          productCache.byCategory[product.category][existingIndex] = product;
        } else {
          productCache.byCategory[product.category].push(product);
        }
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error getting featured products:', error);
    throw new Error('Failed to fetch featured products');
  }
};

// Get new arrivals with caching
export const getNewArrivals = async (limitCount: number = 8): Promise<Product[]> => {
  try {
    // If we have all products cached, filter them
    if (isCacheValid() && productCache.all) {
      const newArrivals = productCache.all
        .filter(p => p.new)
        .slice(0, limitCount);
        
      if (newArrivals.length > 0) {
        console.log('Returning new arrivals from cache');
        return newArrivals;
      }
    }
    
    console.log('Fetching new arrivals from Firestore');
    const q = query(
      productsCollection,
      where('new', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Product));
    
    // Update byId cache
    products.forEach(product => {
      productCache.byId[product.id] = product;
      
      // Update category cache if needed
      if (product.category) {
        if (!productCache.byCategory[product.category]) {
          productCache.byCategory[product.category] = [];
        }
        
        // Check if product already exists in category cache
        const existingIndex = productCache.byCategory[product.category].findIndex(
          p => p.id === product.id
        );
        
        if (existingIndex >= 0) {
          productCache.byCategory[product.category][existingIndex] = product;
        } else {
          productCache.byCategory[product.category].push(product);
        }
      }
    });
    
    return products;
  } catch (error) {
    console.error('Error getting new arrivals:', error);
    throw new Error('Failed to fetch new arrivals');
  }
};

// Get product by ID with caching
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // Check if product is in cache
    if (productCache.byId[id]) {
      console.log(`Returning product ${id} from cache`);
      return productCache.byId[id];
    }
    
    console.log(`Fetching product ${id} from Firestore`);
    const productDoc = doc(db, 'products', id);
    const snapshot = await getDoc(productDoc);
    
    if (snapshot.exists()) {
      const product = {
        id: snapshot.id,
        ...snapshot.data()
      } as Product;
      
      // Update cache
      productCache.byId[id] = product;
      
      return product;
    }
    return null;
  } catch (error) {
    console.error('Error getting product:', error);
    throw new Error('Failed to fetch product details');
  }
};

// Clear cache for a specific product
const invalidateProductCache = (productId: string, categoryId?: string) => {
  // Remove from byId cache
  if (productCache.byId[productId]) {
    delete productCache.byId[productId];
  }
  
  // Remove from category cache if category is provided
  if (categoryId && productCache.byCategory[categoryId]) {
    productCache.byCategory[categoryId] = productCache.byCategory[categoryId].filter(
      p => p.id !== productId
    );
  }
  
  // Set all cache to null to force refresh on next fetch
  productCache.all = null;
};

// Clear entire cache
export const clearProductCache = () => {
  console.log('Clearing product cache to force fresh data fetch');
  productCache.all = null;
  productCache.byId = {};
  productCache.byCategory = {};
  productCache.lastFetched = 0;
};

// Ensure we have a valid storage instance
const getStorageInstance = () => {
  const storage = typeof window !== 'undefined' ? getStorage(app) : null;
  if (storage === null) {
    return getStorage(app);
  }
  return storage;
};

// Upload image to Firebase Storage
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image file is too large. Please select an image smaller than 5MB.');
    }
    
    // Convert file to base64
    const base64String = await fileToBase64(file);
    
    // Create a unique ID for the image
    const timestamp = new Date().getTime();
    const fileName = `product_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Store the base64 image in Firestore
    const imageCollection = collection(db, 'images');
    const imageDoc = await addDoc(imageCollection, {
      name: fileName,
      type: file.type,
      base64: base64String,
      createdAt: serverTimestamp()
    });
    
    // Return the document ID as the image URL
    return `base64://${imageDoc.id}`;
  } catch (error) {
    console.error('Error uploading image:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to upload product image. Please try again.');
    }
  }
};

// Helper function to convert File to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to read image file'));
        }
      };
      reader.onerror = () => {
        reject(new Error('Error reading image file. Please try a different image.'));
      };
    } catch (error) {
      reject(error instanceof Error ? error : new Error('Unknown error processing image'));
    }
  });
};

// Get image by ID
export const getImageById = async (imageId: string): Promise<string> => {
  try {
    console.log(`Fetching image with ID: ${imageId}`);
    const imageDoc = doc(db, 'images', imageId);
    const snapshot = await getDoc(imageDoc);
    
    if (snapshot.exists()) {
      const data = snapshot.data();
      
      if (!data || !data.base64) {
        console.error(`Image exists but has no base64 data. ID: ${imageId}`);
        return '/images/placeholder.jpg';
      }
      
      console.log(`Successfully retrieved base64 image. ID: ${imageId}`);
      return data.base64;
    }
    
    console.error(`Image not found with ID: ${imageId}`);
    return '/images/placeholder.jpg';
  } catch (error) {
    console.error('Error getting image:', error);
    // Return a placeholder instead of throwing, to prevent UI breaking
    return '/images/placeholder.jpg';
  }
};

// Delete product image from Firestore
export const deleteProductImage = async (imageUrl: string): Promise<void> => {
  try {
    // Check if it's a base64 image
    if (imageUrl.startsWith('base64://')) {
      const imageId = imageUrl.replace('base64://', '');
      const imageDoc = doc(db, 'images', imageId);
      await deleteDoc(imageDoc);
      console.log('Product image deleted successfully from Firestore:', imageId);
      return;
    }
    
    // Handle legacy Storage URLs
    const storage = getStorageInstance();
    
    // Extract the file path from the URL
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf('product_images');
    
    if (startIndex === -1) {
      console.warn('Not a Firebase Storage URL or not in product_images folder:', imageUrl);
      return;
    }
    
    const endIndex = decodedUrl.indexOf('?', startIndex);
    const filePath = endIndex !== -1 
      ? decodedUrl.substring(startIndex, endIndex) 
      : decodedUrl.substring(startIndex);
    
    // Create a reference to the file
    const imageRef = ref(storage, filePath);
    
    // Delete the file
    await deleteObject(imageRef);
    console.log('Product image deleted successfully from Storage:', filePath);
  } catch (error) {
    console.error('Error deleting product image:', error);
    // Don't throw error here, as we want to continue with product deletion
    // even if image deletion fails
  }
};

// Add a new product with transaction for category tracking
export const addProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  try {
    console.log('Adding product to Firestore:', product);
    
    // Validate product data
    const validationError = validateProduct(product);
    if (validationError) {
      throw new Error(validationError);
    }
    
    // Clean the product data for Firestore
    const cleanedProduct = cleanProductData(product);
    console.log('Cleaned product data for Firestore:', cleanedProduct);
    
    // Use transaction to add product and update category data
    const newProduct = await runTransaction(db, async (transaction) => {
      // Add the product document
      const docRef = await addDoc(productsCollection, cleanedProduct);
      const newProductWithId = { 
        id: docRef.id, 
        ...cleanedProduct 
      } as unknown as Product;
      
      // Update or create category count
      const categoryRef = doc(categoriesCollection, cleanedProduct.category);
      const categoryDoc = await transaction.get(categoryRef);
      
      if (categoryDoc.exists()) {
        // Update existing category
        transaction.update(categoryRef, {
          count: (categoryDoc.data().count || 0) + 1,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new category
        transaction.set(categoryRef, {
          id: cleanedProduct.category,
          name: cleanedProduct.category.charAt(0).toUpperCase() + cleanedProduct.category.slice(1),
          count: 1,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      return newProductWithId;
    });
    
    // Clear cache completely to ensure fresh data on next fetch
    clearProductCache();
    
    console.log('Product added successfully with ID:', newProduct.id);
    return newProduct as Product;
  } catch (error) {
    console.error('Error adding product to Firestore:', error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
  try {
    console.log(`Updating product ${id} with:`, product);
    const productDoc = doc(db, 'products', id);
    
    // Get existing product to check if category is changing
    const existingProductSnap = await getDoc(productDoc);
    if (!existingProductSnap.exists()) {
      throw new Error('Product not found');
    }
    
    const existingProduct = existingProductSnap.data();
    const cleanedUpdates = cleanProductData(product);
    
    // Always update the timestamp when modified
    cleanedUpdates.updatedAt = serverTimestamp();
    
    await runTransaction(db, async (transaction) => {
      // Update product document
      transaction.update(productDoc, cleanedUpdates);
      
      // If category changed, update both old and new category counts
      if (product.category && existingProduct.category !== product.category) {
        // Decrease old category count
        const oldCategoryRef = doc(categoriesCollection, existingProduct.category);
        const oldCategoryDoc = await transaction.get(oldCategoryRef);
        
        if (oldCategoryDoc.exists()) {
          const oldCount = oldCategoryDoc.data().count || 0;
          if (oldCount > 1) {
            transaction.update(oldCategoryRef, { 
              count: oldCount - 1,
              updatedAt: serverTimestamp()
            });
          } else {
            // Delete category if it will be empty
            transaction.delete(oldCategoryRef);
          }
        }
        
        // Increase new category count
        const newCategoryRef = doc(categoriesCollection, product.category);
        const newCategoryDoc = await transaction.get(newCategoryRef);
        
        if (newCategoryDoc.exists()) {
          transaction.update(newCategoryRef, { 
            count: (newCategoryDoc.data().count || 0) + 1,
            updatedAt: serverTimestamp()
          });
        } else {
          transaction.set(newCategoryRef, {
            id: product.category,
            name: product.category.charAt(0).toUpperCase() + product.category.slice(1),
            count: 1,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
      }
    });
    
    // Clear cache completely to ensure fresh data on next fetch
    clearProductCache();
    console.log(`Product ${id} updated successfully`);
    
  } catch (error) {
    console.error('Error updating product:', error);
    throw new Error('Failed to update product');
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    console.log(`Deleting product ${id}`);
    const productDoc = doc(db, 'products', id);
    
    // Get product to find its category and image URL
    const productSnap = await getDoc(productDoc);
    if (!productSnap.exists()) {
      throw new Error('Product not found');
    }
    
    const productData = productSnap.data() as Product;
    
    // Try to delete the product image first
    if (productData.image) {
      try {
        await deleteProductImage(productData.image);
      } catch (error) {
        console.error('Error deleting product image:', error);
        // Continue with product deletion even if image deletion fails
      }
    }
    
    await runTransaction(db, async (transaction) => {
      // Delete product
      transaction.delete(productDoc);
      
      // Update category count
      if (productData.category) {
        const categoryRef = doc(categoriesCollection, productData.category);
        const categoryDoc = await transaction.get(categoryRef);
        
        if (categoryDoc.exists()) {
          const count = categoryDoc.data().count || 0;
          if (count > 1) {
            transaction.update(categoryRef, { 
              count: count - 1,
              updatedAt: serverTimestamp()
            });
          } else {
            // Delete category if it will be empty
            transaction.delete(categoryRef);
          }
        }
      }
    });
    
    // Clear cache completely to ensure fresh data on next fetch
    clearProductCache();
    console.log(`Product ${id} deleted successfully`);
    
  } catch (error) {
    console.error('Error deleting product:', error);
    throw new Error('Failed to delete product');
  }
};

// Get all categories with product counts
export const getAllCategories = async () => {
  try {
    const snapshot = await getDocs(categoriesCollection);
    return snapshot.docs.map(doc => doc.data());
  } catch (error) {
    console.error('Error getting categories:', error);
    throw new Error('Failed to fetch categories');
  }
}; 