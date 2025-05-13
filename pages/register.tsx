import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaArrowRight, FaGoogle } from 'react-icons/fa';
import Layout from '../components/Layout';
import { signInWithGoogle, sendPreRegistrationVerification } from '../utils/firebaseAuth';
import styles from '../styles/Auth.module.css';

const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [errors, setErrors] = useState<{ 
    name?: string; 
    email?: string;
    general?: string;
  }>({});
  
  const router = useRouter();

  const validateForm = () => {
    const newErrors: { 
      name?: string; 
      email?: string;
    } = {};
    let isValid = true;

    if (!name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    }

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
      // Send verification email first
      const result = await sendPreRegistrationVerification(email);
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Verification email sent. Please check your inbox and verify your email before continuing.', 'success');
        }
        
        // Show the verification sent message
        setVerificationSent(true);
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred while sending verification email' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsSubmitting(true);
    setErrors({});
    
    try {
      const result = await signInWithGoogle();
      
      if (result.success) {
        if (typeof window !== 'undefined' && window.showNotification) {
          window.showNotification('Signup with Google successful!', 'success');
        }
        router.push('/');
      } else {
        setErrors({ general: result.message });
      }
    } catch (error) {
      setErrors({ general: 'An error occurred during Google signup' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout title="Create Account - Nikhil's Jeans">
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          {verificationSent ? (
            <div className={styles.successMessage}>
              <h2>Verification Email Sent!</h2>
              <p>We've sent a verification email to <strong>{email}</strong>.</p>
              <p>Please check your inbox (and spam folder) and click the verification link to continue with your registration.</p>
              <p className={styles.smallText}>After verification, you will be able to create a password and complete your account setup.</p>
            </div>
          ) : (
            <>
              <div className={styles.authHeader}>
                <h1>Create an Account</h1>
                <p>Join us to start shopping</p>
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
                
                <div className={styles.verificationNote}>
                  <p>We'll send a verification link to your email. Your account will only be created after verification.</p>
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
                  {isSubmitting ? 'Sending Verification...' : 'Verify Email'}
                  {!isSubmitting && <FaArrowRight />}
                </button>
              </form>
              
              <div className={styles.socialLogin}>
                <div className={styles.socialSeparator}>
                  <span>or sign up with</span>
                </div>
                
                <div className={styles.socialButtons}>
                  <button 
                    type="button"
                    className={`${styles.socialButton} ${styles.googleButton}`}
                    onClick={handleGoogleSignup}
                    disabled={isSubmitting}
                  >
                    <FaGoogle />
                    Google
                  </button>
                </div>
              </div>
              
              <div className={styles.authSwitch}>
                <p>Already have an account? <Link href="/login">Sign In</Link></p>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RegisterPage; 