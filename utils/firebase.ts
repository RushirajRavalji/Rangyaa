// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD_spb43jww6Pl9OFpIOMzg2LFrH-VbasQ",
  authDomain: "nikhils-jeans-website.firebaseapp.com",
  projectId: "nikhils-jeans-website",
  storageBucket: "nikhils-jeans-website.firebasestorage.app",
  messagingSenderId: "89588207516",
  appId: "1:89588207516:web:0cfbe407bb6d7cc8764259",
  measurementId: "G-ZHMF1GS857"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, analytics }; 