import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  FirebaseBanner, 
  getAllBanners, 
  getBannersByPage, 
  addBanner as addFirebaseBanner, 
  updateBanner as updateFirebaseBanner, 
  deleteBanner as deleteFirebaseBanner
} from '../utils/firebaseBanners';

interface BannerContextProps {
  banners: FirebaseBanner[];
  loading: boolean;
  error: string | null;
  getBannersForPage: (page: string) => Promise<FirebaseBanner[]>;
  addNewBanner: (banner: Omit<FirebaseBanner, 'id' | 'createdAt' | 'updatedAt'>) => Promise<FirebaseBanner>;
  updateExistingBanner: (id: string, updates: Partial<FirebaseBanner>) => Promise<void>;
  removeBanner: (id: string) => Promise<void>;
  refreshBanners: () => Promise<void>;
}

const BannerContext = createContext<BannerContextProps | undefined>(undefined);

export function BannerProvider({ children }: { children: React.ReactNode }) {
  const [banners, setBanners] = useState<FirebaseBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());

  // Load banners from Firebase
  const loadBanners = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedBanners = await getAllBanners();
      setBanners(fetchedBanners);
      setError(null);
      setLastRefreshed(Date.now());
    } catch (err: any) {
      setError(err.message || 'Failed to load banners');
      console.error('Error loading banners:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load banners on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadBanners();
    }
  }, [loadBanners]);

  // Create a memoized cache for getBannersForPage
  const bannersByPageCache = useMemo(() => {
    const cache: Record<string, FirebaseBanner[]> = {};
    
    // Pre-populate cache with current banners
    banners.forEach(banner => {
      if (!cache[banner.page]) {
        cache[banner.page] = [];
      }
      cache[banner.page].push(banner);
    });
    
    // Sort banners by order for each page
    Object.keys(cache).forEach(page => {
      cache[page].sort((a, b) => a.order - b.order);
    });
    
    return cache;
  }, [banners, lastRefreshed]);

  // Get banners for a specific page (using cache when available)
  const getBannersForPage = useCallback(async (page: string): Promise<FirebaseBanner[]> => {
    // Check cache first
    if (bannersByPageCache[page]) {
      return bannersByPageCache[page];
    }
    
    // If not in cache, get from Firebase
    try {
      const pageBanners = await getBannersByPage(page);
      return pageBanners;
    } catch (err) {
      console.error(`Error getting banners for page ${page}:`, err);
      return [];
    }
  }, [bannersByPageCache]);

  // Add a new banner
  const addNewBanner = useCallback(async (bannerData: Omit<FirebaseBanner, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseBanner> => {
    try {
      const newBanner = await addFirebaseBanner(bannerData);
      await loadBanners(); // Refresh the banners state
      return newBanner;
    } catch (err: any) {
      setError(err.message || 'Failed to add banner');
      throw err;
    }
  }, [loadBanners]);

  // Update an existing banner
  const updateExistingBanner = useCallback(async (id: string, updates: Partial<FirebaseBanner>): Promise<void> => {
    try {
      await updateFirebaseBanner(id, updates);
      await loadBanners(); // Refresh the banners state
    } catch (err: any) {
      setError(err.message || 'Failed to update banner');
      throw err;
    }
  }, [loadBanners]);

  // Remove a banner
  const removeBanner = useCallback(async (id: string): Promise<void> => {
    try {
      await deleteFirebaseBanner(id);
      await loadBanners(); // Refresh the banners state
    } catch (err: any) {
      setError(err.message || 'Failed to delete banner');
      throw err;
    }
  }, [loadBanners]);

  // Refresh banners
  const refreshBanners = useCallback(async () => {
    await loadBanners();
  }, [loadBanners]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    banners,
    loading,
    error,
    getBannersForPage,
    addNewBanner,
    updateExistingBanner,
    removeBanner,
    refreshBanners
  }), [
    banners,
    loading,
    error,
    getBannersForPage,
    addNewBanner,
    updateExistingBanner,
    removeBanner,
    refreshBanners
  ]);

  return (
    <BannerContext.Provider value={contextValue}>
      {children}
    </BannerContext.Provider>
  );
}

export const useBanners = (): BannerContextProps => {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanners must be used within a BannerProvider');
  }
  return context;
}; 