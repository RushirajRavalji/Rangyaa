// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_spb43jww6Pl9OFpIOMzg2LFrH-VbasQ",
  authDomain: "nikhils-jeans-website.firebaseapp.com",
  projectId: "nikhils-jeans-website",
  storageBucket: "nikhils-jeans-website.appspot.com",
  messagingSenderId: "89588207516",
  appId: "1:89588207516:web:0cfbe407bb6d7cc8764259",
  measurementId: "G-ZHMF1GS857"
};

// Initialize Firebase - check if already initialized
let app: FirebaseApp;
try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  console.log("Firebase initialized successfully");
} catch (error) {
  console.error("Error initializing Firebase:", error);
  // Initialize with a fallback in case there was an error
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
}

// Initialize Analytics only on client side
let analytics: Analytics | null = null;
try {
  analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
} catch (error) {
  console.error("Error initializing Firebase Analytics:", error);
}

// Initialize Firestore
let db: Firestore | null = null;
try {
  db = typeof window !== 'undefined' ? getFirestore(app) : null;
} catch (error) {
  console.error("Error initializing Firestore:", error);
}

// Initialize Storage
let storage: FirebaseStorage | null = null;
try {
  storage = typeof window !== 'undefined' ? getStorage(app) : null;
} catch (error) {
  console.error("Error initializing Firebase Storage:", error);
}

export { app, analytics, db, storage }; 