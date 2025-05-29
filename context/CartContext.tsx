import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product } from '../data/products';
import { CartItem } from '../data/types';

interface CartContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, quantity?: number, size?: string, color?: { name: string; code: string }) => void;
  removeFromCart: (productId: string) => void;
  updateCartItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart and wishlist from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCart = localStorage.getItem('nikhilsJeansCart');
        const savedWishlist = localStorage.getItem('nikhilsJeansWishlist');
        
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
        
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
      
      setIsInitialized(true);
    }
  }, []);

  // Save cart and wishlist to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && typeof window !== 'undefined') {
      localStorage.setItem('nikhilsJeansCart', JSON.stringify(cart));
      localStorage.setItem('nikhilsJeansWishlist', JSON.stringify(wishlist));
    }
  }, [cart, wishlist, isInitialized]);

  const addToCart = (
    product: Product,
    quantity: number = 1,
    size?: string,
    color?: { name: string; code: string }
  ) => {
    const selectedSize = size ?? (product.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
    const selectedColor = color || (product.colors ? product.colors[0] : undefined);
    
    setCart(prevCart => {
      // Check if product already exists in cart with same size and color
      const existingItemIndex = prevCart.findIndex(
        item => 
          item.product.id === product.id && 
          item.size === selectedSize && 
          ((!item.color && !selectedColor) || 
          (item.color?.code === selectedColor?.code))
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity of existing item
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        
        // Show notification
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(`Updated quantity for ${product.name}`);
        }
        
        return updatedCart;
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          product,
          quantity,
          size: selectedSize,
          color: selectedColor
        };
        
        // Show notification
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(`${product.name} added to cart`);
        }
        
        return [...prevCart, newItem];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => {
      const updatedCart = prevCart.filter(item => item.product.id !== productId);
      
      // Show notification
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification('Item removed from cart');
      }
      
      return updatedCart;
    });
  };

  const updateCartItemQuantity = (productId: string, quantity: number) => {
    setCart(prevCart => {
      const updatedCart = prevCart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: Math.max(1, quantity) } 
          : item
      );
      
      return updatedCart;
    });
  };

  const clearCart = () => {
    setCart([]);
    
    // Show notification
    if (typeof window !== 'undefined' && window.showNotification) {
      window.showNotification('Cart cleared');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const toggleWishlist = (product: Product) => {
    setWishlist(prevWishlist => {
      const isInWishlist = prevWishlist.some(item => item.id === product.id);
      
      if (isInWishlist) {
        // Remove from wishlist
        const updatedWishlist = prevWishlist.filter(item => item.id !== product.id);
        
        // Show notification
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(`${product.name} removed from wishlist`);
        }
        
        return updatedWishlist;
      } else {
        // Add to wishlist
        // Show notification
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(`${product.name} added to wishlist`);
        }
        
        return [...prevWishlist, product];
      }
    });
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  const value: CartContextType = {
    cart,
    wishlist,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    toggleWishlist,
    isInWishlist
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}; 