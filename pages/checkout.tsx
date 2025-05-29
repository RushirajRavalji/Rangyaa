import React, { useState } from 'react';
import Layout from '../components/Layout';
import { FaCreditCard, FaArrowRight, FaMoneyBillWave, FaPaypal, FaCcVisa, FaCcMastercard } from 'react-icons/fa';
import Link from 'next/link';
import styles from '../styles/Checkout.module.css';
import { useProducts } from '../context/ProductContext';
import { validateRequired, validateEmail } from '../utils/formValidation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { processCheckout } from '../utils/checkout';
import { useRouter } from 'next/router';

interface FormValues {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  paymentMethod: 'cod' | 'card' | 'paypal';
}

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [processingOrder, setProcessingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  
  const [formValues, setFormValues] = useState<FormValues>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'india',
    phone: '',
    email: '',
    paymentMethod: 'cod'
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  
  const cartTotal = getCartTotal();
  const tax = Math.round(cartTotal * 0.1); // 10% tax
  const total = cartTotal + tax;
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormValues({
      ...formValues,
      [id]: value
    });
    
    // Clear error when field is changed
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: ''
      });
    }
  };
  
  const validateField = (id: string, value: string): string => {
    switch(id) {
      case 'firstName':
      case 'lastName':
      case 'address':
      case 'city':
      case 'state':
      case 'zipCode':
        const error = validateRequired(value, id);
        return error ? error.message : '';
      case 'email':
        const emailError = validateEmail(value);
        return emailError ? emailError.message : '';
      default:
        return '';
    }
  };
  
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    const error = validateField(id, value);
    
    setFormErrors({
      ...formErrors,
      [id]: error
    });
  };
  
  const handleSubmitShipping = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let hasErrors = false;
    
    // Only validate shipping fields in step 1
    const shippingFields = ['firstName', 'lastName', 'address', 'city', 'state', 'zipCode', 'email'];
    
    shippingFields.forEach(key => {
      const value = formValues[key as keyof FormValues] as string;
      const error = validateField(key, value);
      if (error) {
        newErrors[key] = error;
        hasErrors = true;
      }
    });
    
    setFormErrors(newErrors);
    setSubmitted(true);
    
    if (!hasErrors) {
      // Proceed to payment step
      setCurrentStep('payment');
    }
  };
  
  const handlePaymentMethodChange = (method: 'cod' | 'card' | 'paypal') => {
    setFormValues({
      ...formValues,
      paymentMethod: method
    });
  };
  
  const handlePlaceOrder = async () => {
    try {
      if (!user) {
        setOrderError("You must be logged in to complete your order");
        return;
      }
      
      setProcessingOrder(true);
      setOrderError(null);
      
      // Create shipping details object from form values
      const shippingDetails = {
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        address: formValues.address,
        city: formValues.city,
        state: formValues.state,
        zipCode: formValues.zipCode,
        country: formValues.country,
        phone: formValues.phone,
        email: formValues.email
      };
      
      // Process the order
      const id = await processCheckout(
        user.id,
        cart.map(item => ({
          product: item.product,
          quantity: item.quantity,
          size: item.size || 'One Size'
        })),
        shippingDetails,
        total
      );
      
      // Set order ID and move to confirmation step
      setOrderId(id);
      setCurrentStep('confirmation');
      clearCart();
      
    } catch (error: any) {
      console.error("Order processing error:", error);
      setOrderError(error.message || "Failed to process your order. Please try again.");
    } finally {
      setProcessingOrder(false);
    }
  };
  
  // Render step components
  const renderShippingStep = () => (
    <div className={styles.shippingForm}>
      <h2>Shipping Information</h2>
      <form onSubmit={handleSubmitShipping} noValidate>
        <div className={styles.formRow}>
          <div className={`${styles.formGroup} required-field`}>
            <label htmlFor="firstName">First Name</label>
            <input 
              type="text" 
              id="firstName" 
              value={formValues.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your first name" 
              className={formErrors.firstName ? 'error-field' : ''}
            />
            {formErrors.firstName && <span className="error-message">{formErrors.firstName}</span>}
          </div>
          <div className={`${styles.formGroup} required-field`}>
            <label htmlFor="lastName">Last Name</label>
            <input 
              type="text" 
              id="lastName" 
              value={formValues.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your last name" 
              className={formErrors.lastName ? 'error-field' : ''}
            />
            {formErrors.lastName && <span className="error-message">{formErrors.lastName}</span>}
          </div>
        </div>
        
        <div className={`${styles.formGroup} required-field`}>
          <label htmlFor="address">Street Address</label>
          <input 
            type="text" 
            id="address" 
            value={formValues.address}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your street address" 
            className={formErrors.address ? 'error-field' : ''}
          />
          {formErrors.address && <span className="error-message">{formErrors.address}</span>}
        </div>
        
        <div className={styles.formRow}>
          <div className={`${styles.formGroup} required-field`}>
            <label htmlFor="city">City</label>
            <input 
              type="text" 
              id="city" 
              value={formValues.city}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your city" 
              className={formErrors.city ? 'error-field' : ''}
            />
            {formErrors.city && <span className="error-message">{formErrors.city}</span>}
          </div>
          <div className={`${styles.formGroup} required-field`}>
            <label htmlFor="state">State</label>
            <input 
              type="text" 
              id="state" 
              value={formValues.state}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your state" 
              className={formErrors.state ? 'error-field' : ''}
            />
            {formErrors.state && <span className="error-message">{formErrors.state}</span>}
          </div>
        </div>
        
        <div className={styles.formRow}>
          <div className={`${styles.formGroup} required-field`}>
            <label htmlFor="zipCode">Zip Code</label>
            <input 
              type="text" 
              id="zipCode" 
              value={formValues.zipCode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter your zip code" 
              className={formErrors.zipCode ? 'error-field' : ''}
            />
            {formErrors.zipCode && <span className="error-message">{formErrors.zipCode}</span>}
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="country">Country</label>
            <select 
              id="country"
              value={formValues.country}
              onChange={handleChange}
            >
              <option value="india">India</option>
              <option value="usa">United States</option>
              <option value="uk">United Kingdom</option>
            </select>
          </div>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <input 
            type="tel" 
            id="phone" 
            value={formValues.phone}
            onChange={handleChange}
            placeholder="Enter your phone number" 
          />
        </div>
        
        <div className={`${styles.formGroup} required-field`}>
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            value={formValues.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Enter your email address" 
            className={formErrors.email ? 'error-field' : ''}
          />
          {formErrors.email && <span className="error-message">{formErrors.email}</span>}
        </div>
        
        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
          >
            Continue to Payment <FaArrowRight />
          </button>
        </div>
      </form>
    </div>
  );
  
  const renderPaymentStep = () => (
    <div className={styles.paymentForm}>
      <h2>Payment Method</h2>
      <div className={styles.paymentOptions}>
        <div 
          className={`${styles.paymentOption} ${formValues.paymentMethod === 'cod' ? styles.selected : ''}`}
          onClick={() => handlePaymentMethodChange('cod')}
        >
          <div className={styles.paymentOptionIcon}>
            <FaMoneyBillWave />
          </div>
          <div className={styles.paymentOptionInfo}>
            <h4>Cash on Delivery</h4>
            <p>Pay when you receive your order</p>
          </div>
          <div className={styles.paymentOptionRadio}>
            <input 
              type="radio" 
              name="paymentMethod" 
              id="cod"
              checked={formValues.paymentMethod === 'cod'} 
              onChange={() => handlePaymentMethodChange('cod')} 
            />
            <span className={styles.radioCheckmark}></span>
          </div>
        </div>
        
        <div 
          className={`${styles.paymentOption} ${formValues.paymentMethod === 'card' ? styles.selected : ''}`}
          onClick={() => handlePaymentMethodChange('card')}
        >
          <div className={styles.paymentOptionIcon}>
            <FaCreditCard />
          </div>
          <div className={styles.paymentOptionInfo}>
            <h4>Credit / Debit Card</h4>
            <p>Pay securely with your card</p>
            <div className={styles.cardIcons}>
              <FaCcVisa />
              <FaCcMastercard />
            </div>
          </div>
          <div className={styles.paymentOptionRadio}>
            <input 
              type="radio" 
              name="paymentMethod" 
              id="card"
              checked={formValues.paymentMethod === 'card'} 
              onChange={() => handlePaymentMethodChange('card')} 
            />
            <span className={styles.radioCheckmark}></span>
          </div>
        </div>
        
        <div 
          className={`${styles.paymentOption} ${formValues.paymentMethod === 'paypal' ? styles.selected : ''}`}
          onClick={() => handlePaymentMethodChange('paypal')}
        >
          <div className={styles.paymentOptionIcon}>
            <FaPaypal />
          </div>
          <div className={styles.paymentOptionInfo}>
            <h4>PayPal</h4>
            <p>Pay using your PayPal account</p>
          </div>
          <div className={styles.paymentOptionRadio}>
            <input 
              type="radio" 
              name="paymentMethod" 
              id="paypal"
              checked={formValues.paymentMethod === 'paypal'} 
              onChange={() => handlePaymentMethodChange('paypal')} 
            />
            <span className={styles.radioCheckmark}></span>
          </div>
        </div>
      </div>
      
      <div className={styles.formActions}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => setCurrentStep('shipping')}
        >
          Back to Shipping
        </button>
        <button 
          type="button" 
          className={styles.submitButton}
          onClick={handlePlaceOrder}
          disabled={processingOrder}
        >
          {processingOrder ? (
            <span>Processing...</span>
          ) : (
            <span>Place Order <FaArrowRight /></span>
          )}
        </button>
      </div>
      
      {orderError && (
        <div className={styles.orderError}>
          {orderError}
        </div>
      )}
    </div>
  );
  
  const renderConfirmationStep = () => (
    <div className={styles.confirmation}>
      <div className={styles.confirmationIcon}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="40" cy="40" r="40" fill="#4CAF50" fillOpacity="0.2"/>
          <path d="M34.5 49.5L24.5 39.5L20.5 43.5L34.5 57.5L60.5 31.5L56.5 27.5L34.5 49.5Z" fill="#4CAF50"/>
        </svg>
      </div>
      <h2>Order Confirmed!</h2>
      <p className={styles.orderID}>Order ID: {orderId}</p>
      <p className={styles.confirmationText}>
        Thank you for your order! We have received your order and will process it as soon as possible.
        {formValues.paymentMethod === 'cod' ? 
          ' You have chosen Cash on Delivery, so please keep the exact amount ready at the time of delivery.' : 
          ' Your payment has been successfully processed.'}
      </p>
      
      <div className={styles.formActions}>
        <button 
          type="button" 
          className={styles.submitButton}
          onClick={() => {
            // Use window.location.href for a full page refresh to ensure Firebase auth state is loaded
            window.location.href = '/orders';
          }}
        >
          View My Orders
        </button>
        <button 
          type="button" 
          className={styles.shopButton}
          onClick={() => router.push('/')}
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );

  return (
    <Layout title="Checkout">
      <div className="container">
        <div className={styles.checkoutContainer}>
          <h1>Checkout</h1>
          
          <div className={styles.steps}>
            <div className={`${styles.step} ${currentStep === 'shipping' || currentStep === 'payment' || currentStep === 'confirmation' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>1</span>
              <span className={styles.stepName}>Shipping</span>
            </div>
            <div className={styles.stepDivider}></div>
            <div className={`${styles.step} ${currentStep === 'payment' || currentStep === 'confirmation' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>2</span>
              <span className={styles.stepName}>Payment</span>
            </div>
            <div className={styles.stepDivider}></div>
            <div className={`${styles.step} ${currentStep === 'confirmation' ? styles.active : ''}`}>
              <span className={styles.stepNumber}>3</span>
              <span className={styles.stepName}>Confirmation</span>
            </div>
          </div>
          
          <div className={styles.formContainer}>
            <div className={styles.formContent}>
              {currentStep === 'shipping' && renderShippingStep()}
              {currentStep === 'payment' && renderPaymentStep()}
              {currentStep === 'confirmation' && renderConfirmationStep()}
            </div>
            
            {currentStep !== 'confirmation' && (
              <div className={styles.orderSummary}>
                <h2>Order Summary</h2>
                <div className={styles.summaryItems}>
                  <div className={styles.summaryItem}>
                    <span>Subtotal</span>
                    <span>₹{cartTotal}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Tax</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className={`${styles.summaryItem} ${styles.total}`}>
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>
                
                {currentStep === 'shipping' && (
                  <button className={styles.checkoutButton} onClick={handleSubmitShipping}>
                    <FaArrowRight /> PROCEED TO PAYMENT
                  </button>
                )}
                
                {currentStep === 'payment' && (
                  <button 
                    className={styles.checkoutButton} 
                    onClick={handlePlaceOrder}
                    disabled={processingOrder}
                  >
                    {formValues.paymentMethod === 'cod' ? <FaMoneyBillWave /> : <FaCreditCard />}
                    {processingOrder ? 'PROCESSING...' : 'COMPLETE ORDER'}
                  </button>
                )}
                
                <div className={styles.secureInfo}>
                  <small>Secure checkout with 128-bit SSL encryption</small>
                </div>
                
                <div className={styles.returnLink}>
                  <Link href="/cart">
                    <span className={styles.returnToCart}>Return to cart</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Helper component to debug discount issues
function DiscountDebugger() {  
  const { products } = useProducts();  
  const productsWithDiscount = products.filter(p => p.discount !== undefined);    
  
  return (    
    <div className={styles.debugList}>      
      <p>Total products with discount property: {productsWithDiscount.length}</p>      
      <ul>        
        {productsWithDiscount.map(product => (          
          <li key={product.id}>            
            {product.name} - Discount: {product.discount}%             
            {product.discount && product.discount >= 40 ?               
              " (Should appear in sale section)" :               
              " (Not eligible for sale section)"}          
          </li>        
        ))}      
      </ul>    
    </div>  
  );
}

// Add a component to calculate discounts
function DiscountCalculator() {
  const { products } = useProducts();
  
  // Find products with both originalPrice and price but no explicit discount
  const productsWithImpliedDiscount = products.filter(p => 
    p.originalPrice && p.price && p.discount === undefined
  );
  
  // Calculate the implied discount percentage for these products
  const productsWithCalculatedDiscount = productsWithImpliedDiscount.map(product => {
    const originalPrice = product.originalPrice || 0;
    const currentPrice = product.price;
    const discountAmount = originalPrice - currentPrice;
    const discountPercentage = (discountAmount / originalPrice) * 100;
    
    return {
      ...product,
      calculatedDiscount: Math.round(discountPercentage)
    };
  });
  
  return (
    <div className={styles.debugList}>
      <p>Products with price differences but no explicit discount property: {productsWithImpliedDiscount.length}</p>
      <ul>
        {productsWithCalculatedDiscount.map(product => (
          <li key={product.id}>
            {product.name} - Original: ₹{product.originalPrice} - Current: ₹{product.price} - 
            <strong> Calculated discount: {product.calculatedDiscount}%</strong>
            {product.calculatedDiscount >= 40 ? 
              " (Should be in sale but missing discount property)" : 
              " (Not eligible for sale)"}
          </li>
        ))}
      </ul>
      
      {/* Image checker for -47% discount */}
      <h4>Product from the image</h4>
      <p>The product in the image shows a -47% tag but might not have the discount field set in its data.</p>
      <p>For these products to appear in the sale section, they need an explicit 'discount' property set to 47.</p>
    </div>
  );
} 