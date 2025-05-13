import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaUser, FaLock, FaArrowRight } from 'react-icons/fa';
import Layout from '../../components/Layout';
import { useAuth } from '../../context/AuthContext';
import styles from '../../styles/Auth.module.css';

const CompleteRegistrationPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    password?: string; 
    confirmPassword?: string;
    general?: string;
  }>({});
  
  const router = useRouter();
  const { register } = useAuth();
  
  // Get the pending verification email from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pendingEmail = localStorage.getItem('pendingVerificationEmail');
      if (pendingEmail) {
        setEmail(pendingEmail);
      } else {
        // If no pending email, redirect to regular registration
        router.push('/register');
      }
    }
  }, [router]);

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      password?: string; 
      confirmPassword?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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
      // Complete the registration with the verified email
      const result = await register(name, email, password);
      
      if (result.success) {
        // Registration successful - clear the pending email
        if (typeof window !== 'undefined') {
          localStorage.removeItem('pendingVerificationEmail');
        }
        
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Registration successful! Welcome to Nikhil\'s Jeans.', 'success');
        }
        
        // Show success and redirect
        setRegistrationComplete(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during registration' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Complete Registration - Nikhil's Jeans">
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          {registrationComplete ? (
            <div className={styles.successMessage}>
              <h2>Registration Complete!</h2>
              <p>Welcome to Nikhil's Jeans! You're being redirected to the homepage...</p>
            </div>
          ) : (
            <>
              <div className={styles.authHeader}>
                <h1>Complete Your Registration</h1>
                <p>Your email has been verified. Complete the form below to finish creating your account.</p>
              </div>
              
              {errors.general && (
                <div className={styles.errorMessage}>
                  {errors.general}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className={styles.authForm}>
                <div className={styles.formGroup}>
                  <div className={styles.inputWithIcon}>
                    <FaUser className={styles.inputIcon} />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className={errors.name ? styles.inputError : ''}
                    />
                  </div>
                  {errors.name && <div className={styles.errorText}>{errors.name}</div>}
                </div>
                
                <div className={styles.formGroup}>
                  <div className={styles.inputWithoutIcon}>
                    <input 
                      type="email" 
                      value={email}
                      readOnly
                      disabled
                      className={styles.disabledInput}
                    />
                    <div className={styles.smallText}>Email verified ✓</div>
                  </div>
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
                
                <div className={styles.formGroup}>
                  <div className={styles.inputWithIcon}>
                    <FaLock className={styles.inputIcon} />
                    <input 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className={errors.confirmPassword ? styles.inputError : ''}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <div className={styles.errorText}>{errors.confirmPassword}</div>
                  )}
                </div>
                
                <div className={styles.termsCheck}>
                  <label>
                    <input type="checkbox" required />
                    <span>I agree to the <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link></span>
                  </label>
                </div>
                
                <button 
                  type="submit" 
                  className={styles.authButton}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                  {!isSubmitting && <FaArrowRight />}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default CompleteRegistrationPage; 