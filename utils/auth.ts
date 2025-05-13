import { User } from '../data/types';
import { app } from './firebase';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification
} from 'firebase/auth';

const auth = getAuth(app);
const STORAGE_KEY = 'nikhilsJeansUser';

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const userData = localStorage.getItem(STORAGE_KEY);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User; emailVerified?: boolean }> => {
  try {
    // Use Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      // Allow login but return a flag indicating email not verified
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0], 
        email: firebaseUser.email || email,
        emailVerified: false
      };
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      
      return { 
        success: true, 
        message: 'Login successful, but please verify your email',
        user,
        emailVerified: false
      };
    }
    
    // Create user object to match our app's User type
    const user: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0], 
      email: firebaseUser.email || email,
      emailVerified: true
    };
    
    // Still store in localStorage for our app's current functionality
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    return { 
      success: true, 
      message: 'Login successful',
      user,
      emailVerified: true
    };
  } catch (error: any) {
    console.error('Login error:', error);
    let message = 'Invalid email or password';
    
    // Parse Firebase error messages
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      message = 'Invalid email or password';
    } else if (error.code === 'auth/too-many-requests') {
      message = 'Too many failed login attempts. Please try again later.';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your connection.';
    }
    
    return { 
      success: false, 
      message
    };
  }
};

export const register = async (
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User; emailVerificationSent?: boolean }> => {
  try {
    // Use Firebase authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(firebaseUser);
    
    // Create user object
    const user: User = {
      id: firebaseUser.uid,
      name: name || email.split('@')[0],
      email: firebaseUser.email || email,
      emailVerified: false
    };
    
    // Store in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    
    return { 
      success: true, 
      message: 'Registration successful. Please check your email to verify your account.',
      user,
      emailVerificationSent: true
    };
  } catch (error: any) {
    console.error('Registration error:', error);
    let message = 'An error occurred during registration';
    
    // Parse Firebase error messages
    if (error.code === 'auth/email-already-in-use') {
      message = 'User with this email already exists';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/weak-password') {
      message = 'Password is too weak';
    } else if (error.code === 'auth/network-request-failed') {
      message = 'Network error. Please check your connection.';
    }
    
    return { 
      success: false, 
      message
    };
  }
};

export const resendVerificationEmail = async (): Promise<{ success: boolean; message: string }> => {
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

export const logout = (): void => {
  if (typeof window === 'undefined') return;
  
  // Sign out from Firebase
  signOut(auth).catch(error => {
    console.error('Error signing out:', error);
  });
  
  // Remove from localStorage
  localStorage.removeItem(STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return !!getCurrentUser();
};

// Set up auth state listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        emailVerified: firebaseUser.emailVerified
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      // User is signed out
      localStorage.removeItem(STORAGE_KEY);
    }
  });
} 