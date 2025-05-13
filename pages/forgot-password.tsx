import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import Layout from '../components/Layout';
import { sendPasswordReset } from '../utils/firebaseAuth';
import styles from '../styles/Auth.module.css';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { email?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await sendPasswordReset(email);
      
      if (result.success) {
        setIsSuccess(true);
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Password reset email sent. Please check your inbox.', 'success');
        }
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while sending the password reset email' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Forgot Password - Nikhil's Jeans">
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <div className={styles.authHeader}>
            <h1>Forgot Password</h1>
            <p>Enter your email to reset your password</p>
          </div>
          
          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}
          
          {isSuccess ? (
            <div className={styles.successMessage}>
              <p>We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.</p>
              <p className={styles.smallText}>If you don't see the email, please check your spam folder.</p>
              <Link href="/login" className={styles.backToLogin}>
                <FaArrowLeft /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.authForm}>
              <div className={styles.formGroup}>
                <div className={styles.inputWithIcon}>
                  <FaEnvelope className={styles.inputIcon} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className={errors.email ? styles.inputError : ''}
                  />
                </div>
                {errors.email && <div className={styles.errorText}>{errors.email}</div>}
              </div>
              
              <button 
                type="submit" 
                className={styles.authButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Reset Password'}
              </button>
              
              <div className={styles.authSwitch}>
                <p>Remember your password? <Link href="/login">Sign In</Link></p>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPasswordPage; 