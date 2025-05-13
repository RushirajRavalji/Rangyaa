import { app } from './firebase';
import { 
  getAuth, 
  GoogleAuthProvider,
  signInWithPopup,
  UserCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  createUserWithEmailAndPassword,
  applyActionCode,
  signOut
} from 'firebase/auth';
import { User } from '../data/types';

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Convert Firebase user to our app's User type
const createUserFromFirebase = (userCredential: UserCredential): User => {
  const firebaseUser = userCredential.user;
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    email: firebaseUser.email || ''
  };
};

export const signInWithGoogle = async (): Promise<{ success: boolean; message: string; user?: User }> => {
  try {
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = createUserFromFirebase(userCredential);
    
    // Store the user in localStorage
    localStorage.setItem('nikhilsJeansUser', JSON.stringify(user));
    
    return {
      success: true,
      message: 'Successfully signed in with Google',
      user
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    
    // Handle specific Firebase error codes
    let message = 'Failed to sign in with Google';
    if (error.code === 'auth/popup-closed-by-user') {
      message = 'Sign-in popup was closed';
    } else if (error.code === 'auth/cancelled-popup-request') {
      message = 'Multiple popup requests were made';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your connection';
    }
    
    return {
      success: false,
      message
    };
  }
};

// Pre-registration email verification
export const sendPreRegistrationVerification = async (email: string): Promise<{ success: boolean; message: string; verificationSent?: boolean }> => {
  try {
    // Create a temporary user
    const userCredential = await createUserWithEmailAndPassword(auth, email, `temp-${Math.random().toString(36).substring(2, 10)}`);
    const tempUser = userCredential.user;
    
    // Send verification email
    await sendEmailVerification(tempUser);
    
    // Store email in localStorage for later retrieval
    if (typeof window !== 'undefined') {
      localStorage.setItem('pendingVerificationEmail', email);
    }
    
    // Sign out the temporary user - they'll need to complete verification first
    await signOut(auth);
    
    return {
      success: true,
      message: 'Verification email sent. Please check your inbox and verify your email before continuing.',
      verificationSent: true
    };
  } catch (error: any) {
    console.error('Pre-registration verification error:', error);
    
    let message = 'Failed to send verification email';
    if (error.code === 'auth/email-already-in-use') {
      message = 'An account with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your connection';
    }
    
    return {
      success: false,
      message
    };
  }
};

// Verify the email with action code and return success
export const confirmEmailVerification = async (actionCode: string): Promise<{ success: boolean; message: string }> => {
  try {
    await applyActionCode(auth, actionCode);
    
    return {
      success: true,
      message: 'Email verified successfully. You can now complete your registration.'
    };
  } catch (error: any) {
    console.error('Email verification error:', error);
    
    let message = 'Failed to verify email';
    if (error.code === 'auth/invalid-action-code') {
      message = 'The verification link is invalid or has expired';
    } else if (error.code === 'auth/user-not-found') {
      message = 'User not found';
    }
    
    return {
      success: false,
      message
    };
  }
};

// Send email verification
export const sendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return {
        success: false,
        message: 'No user is currently signed in'
      };
    }
    
    await sendEmailVerification(currentUser);
    
    return {
      success: true,
      message: 'Verification email sent. Please check your inbox.'
    };
  } catch (error: any) {
    console.error('Error sending verification email:', error);
    
    let message = 'Failed to send verification email';
    if (error.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please try again later.';
    }
    
    return {
      success: false,
      message
    };
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    let message = 'Failed to send password reset email';
    if (error.code === 'auth/user-not-found') {
      message = 'No user found with this email address';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many requests. Please try again later.';
    }
    
    return {
      success: false,
      message
    };
  }
}; 