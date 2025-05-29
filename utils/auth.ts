import { User } from '../data/types';
import { app } from './firebase';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendEmailVerification,
  getIdToken
} from 'firebase/auth';

const auth = getAuth(app);
const STORAGE_KEY = 'nikhilsJeansAuthToken';

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  // Instead of storing the full user object, we now rely on Firebase's auth state
  const currentUser = auth.currentUser;
  
  if (!currentUser) return null;
  
  return {
    id: currentUser.uid,
    name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
    email: currentUser.email || '',
    emailVerified: currentUser.emailVerified
  };
};

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check if user is authenticated with Firebase
  return !!auth.currentUser;
};

export const login = async (
  email: string,
  password: string
): Promise<{ success: boolean; message: string; user?: User; emailVerified?: boolean }> => {
  try {
    // Use Firebase authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    
    // Store only the auth token in localStorage for persistence
    const token = await firebaseUser.getIdToken();
    localStorage.setItem(STORAGE_KEY, token);
    
    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      // Create user object for the app
      const user: User = {
        id: firebaseUser.uid,
        name: firebaseUser.displayName || email.split('@')[0], 
        email: firebaseUser.email || email,
        emailVerified: false
      };
      
      return { 
        success: true, 
        message: 'Login successful, but please verify your email',
        user,
        emailVerified: false
      };
    }
    
    // Create user object for the app
    const user: User = {
      id: firebaseUser.uid,
      name: firebaseUser.displayName || email.split('@')[0], 
      email: firebaseUser.email || email,
      emailVerified: true
    };
    
    return { 
      success: true, 
      message: 'Login successful',
      user,
      emailVerified: true
    };
  } catch (error: any) {
    console.error('Login error:', error);
    let message = 'An error occurred during login';
    
    // Parse Firebase error messages
    if (error.code === 'auth/user-not-found') {
      message = 'No user found with this email';
    } else if (error.code === 'auth/wrong-password') {
      message = 'Invalid password';
    } else if (error.code === 'auth/invalid-email') {
      message = 'Invalid email address';
    } else if (error.code === 'auth/user-disabled') {
      message = 'This account has been disabled';
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
    
    // Store only the auth token in localStorage for persistence
    const token = await firebaseUser.getIdToken();
    localStorage.setItem(STORAGE_KEY, token);
    
    // Create user object
    const user: User = {
      id: firebaseUser.uid,
      name: name || email.split('@')[0],
      email: firebaseUser.email || email,
      emailVerified: false
    };
    
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

export const logout = async (): Promise<{ success: boolean; message: string }> => {
  try {
    await signOut(auth);
    
    // Clear the auth token from localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      message: 'An error occurred during logout'
    };
  }
};

// Set up auth state listener
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in - update the token
      firebaseUser.getIdToken().then(token => {
        localStorage.setItem(STORAGE_KEY, token);
      });
    } else {
      // User is signed out - remove the token
      localStorage.removeItem(STORAGE_KEY);
    }
  });
  
  // Try to restore the session using the stored token
  const token = localStorage.getItem(STORAGE_KEY);
  if (token && !auth.currentUser) {
    // Token exists but no current user - Firebase will handle the auth state
    // The onAuthStateChanged listener above will be triggered when auth state is restored
    console.log('Attempting to restore authentication session');
  }
} 