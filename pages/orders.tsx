import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { getUserOrders, getOrderById, Order } from '../utils/firebaseDb';
import styles from '../styles/Orders.module.css';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';
import { FaShoppingBag, FaSpinner, FaAngleRight, FaTimes } from 'react-icons/fa';
import { useRouter } from 'next/router';

export default function OrdersPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Format date from Firestore Timestamp
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Fetch user's orders
  useEffect(() => {
    async function fetchOrders() {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        
        // Add a small delay to ensure Firebase is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const fetchedOrders = await getUserOrders(user.id);
        console.log("Fetched orders:", fetchedOrders);
        setOrders(fetchedOrders);
        
      } catch (err: any) {
        console.error('Error fetching orders:', err);
        setError('Failed to load your orders. Please try again.');
        
        // Auto-retry once if failed (might be a Firebase initialization issue)
        if (retryCount < 1) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchOrders(), 1500);
        }
        
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [user, retryCount]);

  // Get status class for styling
  const getStatusClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return styles.delivered;
      case 'shipped':
        return styles.shipped;
      case 'processing':
        return styles.processing;
      case 'cancelled':
        return styles.cancelled;
      default:
        return styles.pending;
    }
  };

  if (!user) {
    return (
      <Layout title="My Orders">
        <div className={styles.ordersContainer}>
          <div className={styles.loginMessage}>
            <h2>Please Login</h2>
            <p>You need to be logged in to view your orders.</p>
            <button 
              onClick={() => router.push('/login')}
              className={styles.loginButton}
            >
              Go to Login
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="My Orders">
      <div className={styles.ordersContainer}>
        <h1 className={styles.title}>My Orders</h1>
        
        {loading ? (
          <div className={styles.loadingContainer}>
            <FaSpinner className={styles.spinner} />
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <p className={styles.errorMessage}>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Try Again
            </button>
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyStateContainer}>
            <div className={styles.emptyStateIcon}>
              <FaShoppingBag size={48} />
            </div>
            <h2>You haven't placed any orders yet</h2>
            <p>Browse our products and place your first order!</p>
            <Link href="/" className={styles.shopNowButton}>
              Shop Now
            </Link>
          </div>
        ) : (
          <>
            {selectedOrder ? (
              <div className={styles.orderDetails}>
                <div className={styles.orderDetailsHeader}>
                  <button 
                    className={styles.backButton} 
                    onClick={() => setSelectedOrder(null)}
                  >
                    Back to All Orders
                  </button>
                  <h2>Order Details</h2>
                  <p className={styles.orderId}>Order #{selectedOrder.id}</p>
                </div>
                
                <div className={styles.orderInfo}>
                  <div className={styles.orderInfoItem}>
                    <span className={styles.label}>Date:</span>
                    <span>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  <div className={styles.orderInfoItem}>
                    <span className={styles.label}>Status:</span>
                    <span className={`${styles.statusBadge} ${getStatusClass(selectedOrder.status)}`}>
                      {selectedOrder.status.toUpperCase()}
                    </span>
                  </div>
                  <div className={styles.orderInfoItem}>
                    <span className={styles.label}>Total:</span>
                    <span className={styles.totalAmount}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className={styles.section}>
                  <h3>Shipping Details</h3>
                  <div className={styles.shippingInfo}>
                    <p>
                      <strong>{selectedOrder.shipping.firstName} {selectedOrder.shipping.lastName}</strong>
                    </p>
                    <p>{selectedOrder.shipping.address}</p>
                    <p>{selectedOrder.shipping.city}, {selectedOrder.shipping.state} {selectedOrder.shipping.zipCode}</p>
                    <p>{selectedOrder.shipping.country}</p>
                    <p>Phone: {selectedOrder.shipping.phone || 'N/A'}</p>
                    <p>Email: {selectedOrder.shipping.email}</p>
                  </div>
                </div>
                
                <div className={styles.section}>
                  <h3>Items</h3>
                  <div className={styles.orderItems}>
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className={styles.orderItem}>
                        <div className={styles.productImage}>
                          {item.image && <img src={item.image} alt={item.name} />}
                        </div>
                        <div className={styles.productDetails}>
                          <h4>{item.name}</h4>
                          <p className={styles.productMeta}>
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                          <p className={styles.productPrice}>₹{item.price.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={styles.orderSummary}>
                  <div className={styles.summaryRow}>
                    <span>Subtotal:</span>
                    <span>₹{(selectedOrder.totalAmount * 0.9).toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tax (10%):</span>
                    <span>₹{(selectedOrder.totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className={`${styles.summaryRow} ${styles.total}`}>
                    <span>Total:</span>
                    <span>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.ordersList}>
                <p className={styles.orderCount}>
                  Showing {orders.length} order{orders.length !== 1 ? 's' : ''}
                </p>
                {orders.map(order => (
                  <div key={order.id} className={styles.orderCard} onClick={() => setSelectedOrder(order)}>
                    <div className={styles.orderHeader}>
                      <div>
                        <span className={styles.orderLabel}>Order #:</span>
                        <span className={styles.orderId}>{order.id}</span>
                      </div>
                      <div className={`${styles.statusBadge} ${getStatusClass(order.status)}`}>
                        {order.status.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className={styles.orderContent}>
                      <div className={styles.orderInfo}>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Date:</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Items:</span>
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.infoLabel}>Total:</span>
                          <span className={styles.orderTotal}>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      <div className={styles.previewItems}>
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div key={idx} className={styles.previewItem}>
                            {item.image && <img src={item.image} alt={item.name} className={styles.previewImage} />}
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className={styles.moreItems}>+{order.items.length - 3}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className={styles.viewDetails}>
                      <span>View Details</span>
                      <FaAngleRight />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
} 