export interface Product {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  price: number;
  originalPrice?: number;
  category: string;
  subcategory?: string;
  image: string;
  gallery?: string[];
  featured: boolean;
  new: boolean;
  stock: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  sizes?: string[];
  colors?: { name: string; code: string }[];
  tags?: string[];
  sku?: string;
  brand?: string;
  material?: string;
  fit?: string;
  careInstructions?: string;
  countryOfOrigin?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Empty product data - all demo products removed
export const products: Product[] = [];

// Helper functions to filter products
export const getFeaturedProducts = (): Product[] => {
  return products.filter(product => product.featured);
};

export const getNewProducts = (): Product[] => {
  return products.filter(product => product.new);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getProductsBySubcategory = (subcategory: string): Product[] => {
  return products.filter(product => product.subcategory === subcategory);
};

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getRelatedProducts = (product: Product, limit = 4): Product[] => {
  return products
    .filter(p => 
      p.id !== product.id && 
      (p.category === product.category || p.subcategory === product.subcategory)
    )
    .slice(0, limit);
};

export const searchProducts = (query: string): Product[] => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.description.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    (product.subcategory && product.subcategory.toLowerCase().includes(searchTerm)) ||
    (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchTerm)))
  );
}; 