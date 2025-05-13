import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import Layout from '../components/Layout';
import { confirmEmailVerification } from '../utils/firebaseAuth';
import styles from '../styles/Auth.module.css';

const VerifyEmailPage = () => {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  
  const router = useRouter();
  const { oobCode } = router.query; // Firebase provides the action code as 'oobCode' in the URL
  
  useEffect(() => {
    async function verifyEmail() {
      if (!oobCode || typeof oobCode !== 'string') {
        setVerificationResult({
          success: false,
          message: 'Invalid verification link'
        });
        setIsVerifying(false);
        return;
      }
      
      try {
        const result = await confirmEmailVerification(oobCode);
        setVerificationResult(result);
      } catch (error) {
        setVerificationResult({
          success: false,
          message: 'Error verifying email. Please try again.'
        });
      } finally {
        setIsVerifying(false);
      }
    }
    
    if (oobCode) {
      verifyEmail();
    }
  }, [oobCode]);
  
  return (
    <Layout title="Verify Email - Nikhil's Jeans">
      <div className={styles.authContainer}>
        <div className={styles.authBox}>
          <div className={styles.authHeader}>
            <h1>Email Verification</h1>
          </div>
          
          <div className={styles.verificationContainer}>
            {isVerifying ? (
              <div className={styles.verifyingState}>
                <FaSpinner className={styles.spinner} />
                <p>Verifying your email...</p>
              </div>
            ) : verificationResult?.success ? (
              <div className={styles.successState}>
                <FaCheckCircle className={styles.successIcon} />
                <h2>Email Verified Successfully!</h2>
                <p>{verificationResult.message}</p>
                <div className={styles.actionButtons}>
                  <Link href="/register/complete" className={styles.primaryButton}>
                    Complete Registration
                  </Link>
                  <Link href="/login" className={styles.secondaryButton}>
                    Go to Login
                  </Link>
                </div>
              </div>
            ) : (
              <div className={styles.errorState}>
                <FaTimesCircle className={styles.errorIcon} />
                <h2>Verification Failed</h2>
                <p>{verificationResult?.message || 'An error occurred during email verification'}</p>
                <div className={styles.actionButtons}>
                  <Link href="/register" className={styles.primaryButton}>
                    Try Again
                  </Link>
                  <Link href="/" className={styles.secondaryButton}>
                    Go to Homepage
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default VerifyEmailPage; 