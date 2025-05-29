import { 
  addDoc, 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  where, 
  Timestamp, 
  doc, 
  getDoc,
  DocumentData,
  limit,
  startAt,
  endAt
} from 'firebase/firestore';
import { db } from './firebase';

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image: string;
}

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  shipping: ShippingDetails;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Save a new order to Firestore
export const saveOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const ordersRef = collection(db, 'orders');
    const timestamp = Timestamp.now();
    
    const orderWithTimestamps = {
      ...orderData,
      createdAt: timestamp,
      updatedAt: timestamp
    };
    
    const docRef = await addDoc(ordersRef, orderWithTimestamps);
    return docRef.id;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Get orders for a specific user
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const ordersRef = collection(db, 'orders');
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data
      } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Get a single order by ID
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const orderRef = doc(db, 'orders', orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      const data = orderDoc.data();
      return {
        id: orderDoc.id,
        ...data
      } as Order;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting order:', error);
    throw error;
  }
};

// Admin: Get all orders with pagination and sorting
export const getAllOrders = async (
  startDate?: Date,
  endDate?: Date,
  sortBy: 'createdAt' | 'totalAmount' = 'createdAt',
  sortDirection: 'asc' | 'desc' = 'desc',
  limitCount: number = 20,
  startAfterDoc?: DocumentData
): Promise<{ orders: Order[], lastDoc: DocumentData | undefined }> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const ordersRef = collection(db, 'orders');
    let q = query(ordersRef, orderBy(sortBy, sortDirection));
    
    // Apply date filters if provided
    if (startDate) {
      const startTimestamp = Timestamp.fromDate(startDate);
      q = query(q, where('createdAt', '>=', startTimestamp));
    }
    
    if (endDate) {
      const endTimestamp = Timestamp.fromDate(endDate);
      q = query(q, where('createdAt', '<=', endTimestamp));
    }
    
    // Apply pagination
    q = query(q, limit(limitCount));
    
    if (startAfterDoc) {
      q = query(q, startAt(startAfterDoc));
    }
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    let lastDoc: DocumentData | undefined = undefined;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data
      } as Order);
      lastDoc = doc;
    });
    
    return { orders, lastDoc };
  } catch (error) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

// Get orders from the last month
export const getLastMonthOrders = async (): Promise<Order[]> => {
  try {
    if (!db) throw new Error('Firestore is not initialized');
    
    const ordersRef = collection(db, 'orders');
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const q = query(
      ordersRef,
      where('createdAt', '>=', Timestamp.fromDate(lastMonth)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const orders: Order[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      orders.push({
        id: doc.id,
        ...data
      } as Order);
    });
    
    return orders;
  } catch (error) {
    console.error('Error getting last month orders:', error);
    throw error;
  }
}; 