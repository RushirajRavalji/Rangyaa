import { app } from './firebase';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// Initialize Storage
export const storage = getStorage(app);

// Upload banner image to Firebase Storage
export const uploadBannerImage = async (file: File): Promise<string> => {
  try {
    // Create a unique filename
    const timestamp = new Date().getTime();
    const fileName = `banner_${timestamp}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    
    // Create a reference to the file in storage
    const storageRef = ref(storage, `banner_images/${fileName}`);
    
    // Upload the file
    await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading banner image:', error);
    throw new Error('Failed to upload banner image');
  }
};

// Delete banner image from Firebase Storage
export const deleteBannerImage = async (imageUrl: string): Promise<void> => {
  try {
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
    const imageRef = ref(storage, filePath);
    
    // Delete the file
    await deleteObject(imageRef);
    console.log('Banner image deleted successfully:', filePath);
  } catch (error) {
    console.error('Error deleting banner image:', error);
    throw new Error('Failed to delete banner image');
  }
}; 