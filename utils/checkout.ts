import { OrderItem, ShippingDetails, saveOrder } from './firebaseDb';
import { Product } from '../data/products';

// Process checkout and place order
export const processCheckout = async (
  userId: string,
  cartItems: { product: Product, quantity: number, size: string }[],
  shippingDetails: ShippingDetails,
  totalAmount: number
): Promise<string> => {
  try {
    // Format cart items to order items format
    const orderItems: OrderItem[] = cartItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      size: item.size,
      image: item.product.image
    }));
    
    // Create the order
    const orderId = await saveOrder({
      userId,
      items: orderItems,
      totalAmount,
      shipping: shippingDetails,
      status: 'pending'
    });
    
    return orderId;
  } catch (error) {
    console.error('Error processing checkout:', error);
    throw error;
  }
}; 