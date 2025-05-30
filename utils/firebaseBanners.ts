import { app, db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp,
  getFirestore
} from 'firebase/firestore';
import { deleteBannerImage } from './firebaseStorage';

// Get Firestore instance - use the imported db or initialize a new one if it's null
const getDb = () => {
  if (db) return db;
  return getFirestore(app);
};

// Collection reference - create it when needed
const getBannersCollection = () => {
  return collection(getDb(), 'banners');
};

// Banner interface
export interface FirebaseBanner {
  id: string;
  page: string;
  imageUrl: string;
  title: string;
  subtitle: string;
  textColor: string;
  order: number;
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
}

// Get all banners
export const getAllBanners = async (): Promise<FirebaseBanner[]> => {
  try {
    const bannersCollection = getBannersCollection();
    const snapshot = await getDocs(bannersCollection);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseBanner));
  } catch (error) {
    console.error('Error getting banners from Firestore:', error);
    throw new Error('Failed to fetch banners');
  }
};

// Get banners by page
export const getBannersByPage = async (page: string): Promise<FirebaseBanner[]> => {
  try {
    const bannersCollection = getBannersCollection();
    const q = query(bannersCollection, where('page', '==', page));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseBanner));
  } catch (error) {
    console.error(`Error getting ${page} banners:`, error);
    throw new Error(`Failed to fetch ${page} banners`);
  }
};

// Add a new banner
export const addBanner = async (banner: Omit<FirebaseBanner, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseBanner> => {
  try {
    // Check if a banner already exists for this page
    const existingBanners = await getBannersByPage(banner.page);
    
    // If a banner exists for this page, delete it first
    if (existingBanners.length > 0) {
      const existingBanner = existingBanners[0];
      await deleteBanner(existingBanner.id);
    }
    
    // Add timestamps
    const bannerWithTimestamps = {
      ...banner,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Add to Firestore
    const bannersCollection = getBannersCollection();
    const docRef = await addDoc(bannersCollection, bannerWithTimestamps);
    
    // Return the new banner with ID
    return {
      id: docRef.id,
      ...bannerWithTimestamps
    } as FirebaseBanner;
  } catch (error) {
    console.error('Error adding banner to Firestore:', error);
    throw error;
  }
};

// Update a banner
export const updateBanner = async (id: string, updates: Partial<FirebaseBanner>): Promise<void> => {
  try {
    const bannerRef = doc(getDb(), 'banners', id);
    
    // Get the current banner data
    const bannerSnapshot = await getDoc(bannerRef);
    if (!bannerSnapshot.exists()) {
      throw new Error('Banner not found');
    }
    
    // Add updated timestamp
    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp()
    };
    
    // If imageUrl is being updated, delete the old image
    if (updates.imageUrl) {
      const currentBanner = bannerSnapshot.data() as FirebaseBanner;
      if (currentBanner.imageUrl && currentBanner.imageUrl !== updates.imageUrl) {
        try {
          await deleteBannerImage(currentBanner.imageUrl);
        } catch (error) {
          console.error('Error deleting old banner image:', error);
          // Continue with the update even if image deletion fails
        }
      }
    }
    
    // Update in Firestore
    await updateDoc(bannerRef, updatesWithTimestamp);
  } catch (error) {
    console.error('Error updating banner in Firestore:', error);
    throw error;
  }
};

// Delete a banner
export const deleteBanner = async (id: string): Promise<void> => {
  try {
    const bannerRef = doc(getDb(), 'banners', id);
    
    // Get the banner data to access the image URL
    const bannerSnapshot = await getDoc(bannerRef);
    if (!bannerSnapshot.exists()) {
      throw new Error('Banner not found');
    }
    
    const bannerData = bannerSnapshot.data() as FirebaseBanner;
    
    // Delete the banner document from Firestore
    await deleteDoc(bannerRef);
    
    // Delete the banner image from Storage
    if (bannerData.imageUrl) {
      try {
        await deleteBannerImage(bannerData.imageUrl);
      } catch (error) {
        console.error('Error deleting banner image:', error);
        // We've already deleted the banner document, so just log the error
      }
    }
  } catch (error) {
    console.error('Error deleting banner from Firestore:', error);
    throw error;
  }
}; 