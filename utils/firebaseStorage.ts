import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, getStorage } from 'firebase/storage';
import { app } from './firebase';

// Ensure we have a valid storage instance
const getStorageInstance = () => {
  if (storage === null) {
    return getStorage(app);
  }
  return storage;
};

// Upload banner image to Firebase Storage
export const uploadBannerImage = async (file: File): Promise<string> => {
  try {
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      throw new Error('Image file is too large. Please select an image smaller than 5MB.');
    }
    
    const storageInstance = getStorageInstance();
    
    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileName = `banner_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Create a reference to the file in storage
    const storageRef = ref(storageInstance, `banner_images/${fileName}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading banner image:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to upload banner image. Please try again.');
    }
  }
};

// Delete banner image from Firebase Storage
export const deleteBannerImage = async (imageUrl: string): Promise<void> => {
  try {
    const storageInstance = getStorageInstance();
    
    // Extract the file path from the URL
    // Firebase Storage URLs contain a token after the file path, so we need to extract just the path
    const decodedUrl = decodeURIComponent(imageUrl);
    const startIndex = decodedUrl.indexOf('banner_images');
    
    if (startIndex === -1) {
      console.warn('Not a Firebase Storage URL or not in banner_images folder:', imageUrl);
      return;
    }
    
    const endIndex = decodedUrl.indexOf('?', startIndex);
    const filePath = endIndex !== -1 
      ? decodedUrl.substring(startIndex, endIndex) 
      : decodedUrl.substring(startIndex);
    
    // Create a reference to the file
    const imageRef = ref(storageInstance, filePath);
    
    // Delete the file
    await deleteObject(imageRef);
    console.log('Banner image deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting banner image:', error);
    throw new Error('Failed to delete banner image');
  }
}; 