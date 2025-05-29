import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaEnvelope, FaLock, FaArrowRight, FaGoogle } from 'react-icons/fa';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { signInWithGoogle } from '../utils/firebaseAuth';
import { sendVerificationEmail } from '../utils/firebaseAuth';
import styles from '../styles/Auth.module.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  
  const router = useRouter();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
    setShowVerification(false);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        // Check if email verification status is provided
        if (result.emailVerified === false) {
          // Email not verified
          setShowVerification(true);
          if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('Please verify your email address', 'warning');
          }
        } else {
          // Email verified or not specified, proceed with login
          if (typeof window !== 'undefined' && window.showNotification) {
            window.showNotification('Login successful. Welcome back!', 'success');
          }
          
          // Redirect to previous page or homepage
          const returnUrl = router.query.returnUrl as string || '/';
          router.push(returnUrl);
        }
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@example.com');
    setPassword('password123');
    
    setIsSubmitting(true);
    setErrors({});

    try {
      const result = await login('demo@example.com', 'password123');
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Demo login successful!', 'success');
        }
        
        // Redirect to previous page or homepage
        const returnUrl = router.query.returnUrl as string || '/';
        router.push(returnUrl);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during login' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Login with Google successful!', 'success');
        }
        
        // Redirect to previous page or homepage
        const returnUrl = router.query.returnUrl as string || '/';
        router.push(returnUrl);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during Google login' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendVerification = async () => {
    setResendingEmail(true);
    
    try {
      const result = await sendVerificationEmail();
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Verification email sent. Please check your inbox.', 'success');
        }
      } else {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification(result.message, 'error');
        }
      }
    } catch (error) {
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification('An error occurred while sending the verification email', 'error');
      }
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <Layout title="Login - Nikhil's Jeans">
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <div className={styles.authHeader}>
            <h1>Welcome Back</h1>
            <p>Sign in to your account to continue</p>
          </div>
          
          {errors.general && (
            <div className={styles.errorMessage}>
              {errors.general}
            </div>
          )}
          
          {showVerification && (
            <div className={styles.verificationMessage}>
              <p>Your email address has not been verified. Please check your inbox for the verification email.</p>
              <p>
                Didn't receive the email?{' '}
                <span 
                  className={styles.resendLink} 
                  onClick={handleResendVerification}
                >
                  {resendingEmail ? 'Sending...' : 'Resend verification email'}
                </span>
              </p>
            </div>
          )}
          
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
            
            <div className={styles.formGroup}>
              <div className={styles.inputWithIcon}>
                <FaLock className={styles.inputIcon} />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className={errors.password ? styles.inputError : ''}
                />
              </div>
              {errors.password && <div className={styles.errorText}>{errors.password}</div>}
            </div>
            
            <div className={styles.forgotPassword}>
              <Link href="/forgot-password">Forgot Password?</Link>
            </div>
            
            <button 
              type="submit" 
              className={styles.authButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
              {!isSubmitting && <FaArrowRight />}
            </button>
          </form>
          
          <button 
            className={styles.demoButton}
            onClick={handleDemoLogin}
            disabled={isSubmitting}
          >
            Use Demo Account
          </button>
          
          <div className={styles.socialLogin}>
            <div className={styles.socialSeparator}>
              <span>or continue with</span>
            </div>
            
            <div className={styles.socialButtons}>
              <button 
                type="button"
                className={`${styles.socialButton} ${styles.googleButton}`}
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
              >
                <FaGoogle />
                Google
              </button>
            </div>
          </div>
          
          <div className={styles.authSwitch}>
            <p>Don't have an account? <Link href="/register">Register</Link></p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LoginPage; 