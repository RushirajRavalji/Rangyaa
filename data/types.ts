import { Product } from './products';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color?: { name: string; code: string };
}

export interface WishlistItem {
  product: Product;
}

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean;
}

export interface Address {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingAddress: Address;
} 