import { useState, useEffect, useRef } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import { Order, getAllOrders, getLastMonthOrders } from '../../utils/firebaseDb';
import styles from '../../styles/AdminPanel.module.css';
import Link from 'next/link';
import { FaSpinner, FaSortAmountDown, FaSortAmountUp, FaFilePdf, FaFileAlt, FaShare, FaAngleLeft, FaAngleRight, FaTimes, FaCalendarAlt, FaBoxOpen, FaImages, FaEye } from 'react-icons/fa';
import { Timestamp, DocumentData } from 'firebase/firestore';
import { useRouter } from 'next/router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ADMIN_EMAIL = 'driger.ray.dranzer@gmail.com';
const ITEMS_PER_PAGE = 10;

export default function AdminOrders() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [viewAll, setViewAll] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [lastDoc, setLastDoc] = useState<DocumentData | undefined>(undefined);
  const [hasMore, setHasMore] = useState<boolean>(true);
  
  // Sort states
  const [sortField, setSortField] = useState<'createdAt' | 'totalAmount'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Date filter refs for custom range
  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  
  // Format date from Firestore Timestamp
  const formatDate = (timestamp: Timestamp | undefined) => {
    if (!timestamp) return 'N/A';
    
    // Use fixed formatting to avoid hydration mismatches
    const date = timestamp.toDate();
    
    // Using a more reliable format string approach without Intl.DateTimeFormat
    const year = date.getFullYear();
    const month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
    const day = date.getDate();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  // Load orders based on current filters
  const loadOrders = async (reset: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      let fetchedOrders: Order[] = [];
      
      if (viewAll) {
        // Fetch with pagination for all orders
        const startDate = startDateRef.current && startDateRef.current.value 
          ? new Date(startDateRef.current.value) 
          : undefined;
          
        const endDate = endDateRef.current && endDateRef.current.value 
          ? new Date(endDateRef.current.value)
          : undefined;
          
        // If resetting pagination
        if (reset) {
          setLastDoc(undefined);
          setCurrentPage(1);
        }
        
        const result = await getAllOrders(
          startDate,
          endDate,
          sortField,
          sortDirection,
          ITEMS_PER_PAGE,
          reset ? undefined : lastDoc
        );
        
        fetchedOrders = result.orders;
        setLastDoc(result.lastDoc);
        setHasMore(fetchedOrders.length === ITEMS_PER_PAGE);
        
        if (reset) {
          setOrders(fetchedOrders);
        } else {
          setOrders(prev => [...prev, ...fetchedOrders]);
        }
      } else {
        // Fetch only last month orders
        fetchedOrders = await getLastMonthOrders();
        setOrders(fetchedOrders);
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadOrders(true);
    }
  }, [user, viewAll, sortField, sortDirection]);
  
  // Handle sort change
  const toggleSort = (field: 'createdAt' | 'totalAmount') => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };
  
  // Generate PDF for order
  const generatePDF = (order: Order) => {
    try {
      // Only run on client side
      if (typeof window === 'undefined') {
        console.warn('PDF generation attempted on server side');
        return;
      }
      
      // Create a new jsPDF instance
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(`Order Details: ${order.id}`, 14, 22);
      
      // Add order info
      doc.setFontSize(12);
      doc.text(`Order Date: ${formatDate(order.createdAt)}`, 14, 35);
      doc.text(`Status: ${order.status.toUpperCase()}`, 14, 42);
      doc.text(`Total Amount: ₹${order.totalAmount.toFixed(2)}`, 14, 49);
      
      // Customer details
      doc.setFontSize(16);
      doc.text('Customer Information', 14, 62);
      doc.setFontSize(12);
      doc.text(`Name: ${order.shipping.firstName} ${order.shipping.lastName}`, 14, 72);
      doc.text(`Email: ${order.shipping.email}`, 14, 79);
      doc.text(`Phone: ${order.shipping.phone || 'N/A'}`, 14, 86);
      doc.text(`Address: ${order.shipping.address}`, 14, 93);
      doc.text(`City: ${order.shipping.city}, ${order.shipping.state}, ${order.shipping.zipCode}`, 14, 100);
      doc.text(`Country: ${order.shipping.country}`, 14, 107);
      
      // Order items
      doc.setFontSize(16);
      doc.text('Order Items', 14, 122);
      
      // Create table for items
      const tableColumn = ["Item", "Size", "Qty", "Price", "Total"];
      const tableRows = order.items.map(item => [
        item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name,
        item.size,
        item.quantity.toString(),
        `₹${item.price.toFixed(2)}`,
        `₹${(item.price * item.quantity).toFixed(2)}`
      ]);
      
      // Add the table to the PDF
      (doc as any).autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 130,
        headStyles: { fillColor: [66, 66, 66] },
        alternateRowStyles: { fillColor: [245, 245, 245] },
        margin: { top: 130 }
      });
      
      // Save the PDF
      doc.save(`order-${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };
  
  // Share order as text
  const shareAsText = (order: Order) => {
    try {
      // Create text format
      let text = `ORDER DETAILS\n\n`;
      text += `Order ID: ${order.id}\n`;
      text += `Order Date: ${formatDate(order.createdAt)}\n`;
      text += `Status: ${order.status.toUpperCase()}\n`;
      text += `Total Amount: ₹${order.totalAmount.toFixed(2)}\n\n`;
      
      text += `CUSTOMER INFORMATION\n`;
      text += `Name: ${order.shipping.firstName} ${order.shipping.lastName}\n`;
      text += `Email: ${order.shipping.email}\n`;
      text += `Phone: ${order.shipping.phone}\n`;
      text += `Address: ${order.shipping.address}\n`;
      text += `City: ${order.shipping.city}, ${order.shipping.state}, ${order.shipping.zipCode}\n`;
      text += `Country: ${order.shipping.country}\n\n`;
      
      text += `ORDER ITEMS\n`;
      order.items.forEach((item, index) => {
        text += `${index + 1}. ${item.name} - Size: ${item.size}, Qty: ${item.quantity}, Price: ₹${item.price.toFixed(2)}\n`;
      });
      
      // Use browser APIs only if they exist (for client-side execution)
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
        if (navigator.share) {
          navigator.share({
            title: `Order #${order.id}`,
            text: text,
          });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(text);
          alert('Order details copied to clipboard');
        } else {
          alert('Sharing not supported on this browser');
        }
      }
    } catch (error) {
      console.error('Error sharing order:', error);
      alert('Failed to share order details. Please try again.');
    }
  };
  
  // Apply date filter
  const applyDateFilter = () => {
    loadOrders(true);
  };
  
  // Reset date filter
  const resetDateFilter = () => {
    if (startDateRef.current) startDateRef.current.value = '';
    if (endDateRef.current) endDateRef.current.value = '';
    loadOrders(true);
  };
  
  // Load more orders for pagination
  const loadMoreOrders = () => {
    if (hasMore && !loading) {
      loadOrders(false);
      setCurrentPage(prev => prev + 1);
    }
  };
  
  // Go to first page
  const goToFirstPage = () => {
    loadOrders(true);
  };
  
  // Truncate order ID for display
  const truncateOrderId = (id: string | undefined) => {
    if (!id) return '';
    return id.length > 10 ? `${id.substring(0, 10)}...` : id;
  };
  
  // Get status badge class
  const getStatusBadgeClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return styles.pending;
      case 'processing': return styles.processing;
      case 'shipped': return styles.shipped;
      case 'delivered': return styles.delivered;
      case 'cancelled': return styles.cancelled;
      default: return '';
    }
  };
  
  // Mobile card component for orders
  const OrderCard = ({ order }: { order: Order }) => {
    return (
      <div className={styles.mobileCard}>
        <div className={styles.mobileCardHeader}>
          <span className={styles.mobileCardTitle}>
            Order #{truncateOrderId(order.id || '')}
          </span>
          <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status || '')}`}>
            {order.status}
          </span>
        </div>
        
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileCardLabel}>Date:</span>
          <span className={styles.mobileCardValue}>{formatDate(order.createdAt)}</span>
        </div>
        
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileCardLabel}>Customer:</span>
          <span className={styles.mobileCardValue}>
            {order.shipping.firstName} {order.shipping.lastName}
          </span>
        </div>
        
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileCardLabel}>Items:</span>
          <span className={styles.mobileCardValue}>{order.items.length}</span>
        </div>
        
        <div className={styles.mobileCardRow}>
          <span className={styles.mobileCardLabel}>Total:</span>
          <span className={styles.mobileCardValue}>₹{order.totalAmount.toFixed(2)}</span>
        </div>
        
        <div className={styles.mobileCardActions}>
          <button 
            className={styles.adminActionBtn}
            onClick={() => setSelectedOrder(order)}
          >
            <FaEye /> View
          </button>
        </div>
      </div>
    );
  };

  // If not admin, redirect to login
  if (user && user.email !== ADMIN_EMAIL) {
    return (
      <Layout title="Admin Access Required">
        <div className="container">
          <h1>Admin Access Required</h1>
          <p>You need to be logged in as an administrator to view this page.</p>
          <p>Your account does not have administrator privileges.</p>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout title="Login Required">
        <div className="container">
          <h1>Login Required</h1>
          <p>Please <Link href="/login">login</Link> to access the admin panel.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Admin Orders" isAdmin={true}>
      <div className={styles.adminPanelContainer}>
        <div className={styles.adminHeader}>
          <h1 className={styles.adminPanelTitle}>Orders Dashboard</h1>
        </div>
        
        <div className={styles.adminNav}>
          <Link href="/admin/orders" className={styles.active}>Dashboard</Link>
          <Link href="/admin/products">Products</Link>
          <Link href="/admin/banners">Banners</Link>
        </div>
        
        <div className={styles.adminControls}>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewButton} ${!viewAll ? styles.active : ''}`}
              onClick={() => setViewAll(false)}
            >
              Last Month
            </button>
            <button 
              className={`${styles.viewButton} ${viewAll ? styles.active : ''}`}
              onClick={() => setViewAll(true)}
            >
              All Orders
            </button>
          </div>
          
          {viewAll && (
            <div className={styles.dateFilter}>
              <div className={styles.dateInputGroup}>
                <label>
                  <FaCalendarAlt /> From:
                  <input 
                    type="date" 
                    ref={startDateRef}
                  />
                </label>
                <label>
                  <FaCalendarAlt /> To:
                  <input 
                    type="date" 
                    ref={endDateRef}
                  />
                </label>
              </div>
              <div className={styles.dateButtons}>
                <button onClick={applyDateFilter} className={styles.applyButton}>Apply Filter</button>
                <button onClick={resetDateFilter} className={styles.resetButton}><FaTimes /> Reset</button>
              </div>
            </div>
          )}
        </div>
        
        {loading && orders.length === 0 ? (
          <div className={styles.loadingCell}>
            <FaSpinner className={styles.spinner} /> Loading orders...
          </div>
        ) : error ? (
          <div className={styles.errorCell}>
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className={styles.emptyCell}>
            No orders found. {viewAll ? 'Try adjusting your filters.' : 'No orders in the last month.'}
          </div>
        ) : (
          <>
            {/* Desktop table view */}
            <div className={styles.tableContainer}>
              <table className={styles.adminTable}>
                <thead>
                  <tr>
                    <th>ORDER ID</th>
                    <th 
                      className={styles.sortableHeader}
                      onClick={() => toggleSort('createdAt')}
                    >
                      DATE {sortField === 'createdAt' && (
                        sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                      )}
                    </th>
                    <th>CUSTOMER</th>
                    <th>ITEMS</th>
                    <th 
                      className={styles.sortableHeader}
                      onClick={() => toggleSort('totalAmount')}
                    >
                      TOTAL {sortField === 'totalAmount' && (
                        sortDirection === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />
                      )}
                    </th>
                    <th>STATUS</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className={styles.orderRow}>
                      <td>{truncateOrderId(order.id || '')}</td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.shipping.firstName} {order.shipping.lastName}</td>
                      <td>{order.items.length}</td>
                      <td>₹{order.totalAmount.toFixed(2)}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.status || '')}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`${styles.adminActionBtn} ${styles.edit}`}
                          onClick={() => setSelectedOrder(order)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile card view */}
            <div className={styles.mobileCardView}>
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
            
            {/* Pagination */}
            {viewAll && (
              <div className={styles.pagination}>
                <button 
                  className={styles.paginationButton}
                  onClick={goToFirstPage}
                  disabled={currentPage === 1}
                >
                  <FaAngleLeft /> First
                </button>
                <span className={styles.pageInfo}>Page {currentPage}</span>
                <button 
                  className={styles.paginationButton}
                  onClick={loadMoreOrders}
                  disabled={!hasMore || loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className={styles.spinner} /> Loading
                    </>
                  ) : (
                    <>
                      Next <FaAngleRight />
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}
        
        {/* Order Details Modal */}
        {selectedOrder && (
          <div className={styles.modalOverlay} onClick={() => setSelectedOrder(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h2>Order #{truncateOrderId(selectedOrder.id || '')}</h2>
                <button 
                  className={styles.closeButton}
                  onClick={() => setSelectedOrder(null)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className={styles.modalBody}>
                <div className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileCardTitle}>Order Details</span>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(selectedOrder.status || '')}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Date:</span>
                    <span className={styles.mobileCardValue}>{formatDate(selectedOrder.createdAt)}</span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Total:</span>
                    <span className={styles.mobileCardValue}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileCardTitle}>Customer Information</span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Name:</span>
                    <span className={styles.mobileCardValue}>
                      {selectedOrder.shipping.firstName} {selectedOrder.shipping.lastName}
                    </span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Email:</span>
                    <span className={styles.mobileCardValue}>{selectedOrder.shipping.email}</span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Phone:</span>
                    <span className={styles.mobileCardValue}>{selectedOrder.shipping.phone || 'N/A'}</span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Address:</span>
                    <span className={styles.mobileCardValue}>{selectedOrder.shipping.address}</span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>City:</span>
                    <span className={styles.mobileCardValue}>
                      {selectedOrder.shipping.city}, {selectedOrder.shipping.state}, {selectedOrder.shipping.zipCode}
                    </span>
                  </div>
                  
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Country:</span>
                    <span className={styles.mobileCardValue}>{selectedOrder.shipping.country}</span>
                  </div>
                </div>
                
                <div className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <span className={styles.mobileCardTitle}>Order Items</span>
                    <span className={styles.mobileCardValue}>{selectedOrder.items.length} items</span>
                  </div>
                  
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className={styles.mobileCard} style={{ margin: '0.5rem 0', boxShadow: 'none', border: '1px dashed #e5e7eb' }}>
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>Item:</span>
                        <span className={styles.mobileCardValue}>{item.name}</span>
                      </div>
                      
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>Size:</span>
                        <span className={styles.mobileCardValue}>{item.size}</span>
                      </div>
                      
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>Quantity:</span>
                        <span className={styles.mobileCardValue}>{item.quantity}</span>
                      </div>
                      
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>Price:</span>
                        <span className={styles.mobileCardValue}>₹{item.price.toFixed(2)}</span>
                      </div>
                      
                      <div className={styles.mobileCardRow}>
                        <span className={styles.mobileCardLabel}>Total:</span>
                        <span className={styles.mobileCardValue}>₹{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                  
                  <div className={styles.mobileCardRow} style={{ marginTop: '1rem', borderTop: '2px solid #e5e7eb', paddingTop: '0.5rem' }}>
                    <span className={styles.mobileCardLabel} style={{ fontWeight: 'bold' }}>Grand Total:</span>
                    <span className={styles.mobileCardValue} style={{ fontWeight: 'bold' }}>₹{selectedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button 
                  className={`${styles.adminActionBtn} ${styles.edit}`}
                  onClick={() => generatePDF(selectedOrder)}
                >
                  <FaFilePdf /> Export PDF
                </button>
                <button 
                  className={styles.adminActionBtn}
                  onClick={() => shareAsText(selectedOrder)}
                >
                  <FaShare /> Share
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Mobile Action Bar */}
        <div className={styles.mobileActionBar}>
          <div className={styles.actionButtons}>
            <button 
              className={`${styles.adminActionBtn} ${styles.edit}`}
              onClick={() => setViewAll(!viewAll)}
            >
              {viewAll ? 'Last Month' : 'All Orders'}
            </button>
            {viewAll && hasMore && (
              <button 
                className={styles.adminActionBtn}
                onClick={loadMoreOrders}
                disabled={loading}
              >
                {loading ? <FaSpinner className={styles.spinner} /> : 'Load More'}
              </button>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
} 