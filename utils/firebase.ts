// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
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
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Analytics only on client side
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Initialize Firestore
const db = typeof window !== 'undefined' ? getFirestore(app) : null;

// Initialize Storage
const storage = typeof window !== 'undefined' ? getStorage(app) : null;

export { app, analytics, db, storage }; 