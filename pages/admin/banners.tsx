import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';

// Completely disable SSR for this component
const AdminBannersClient = dynamic(() => import('./banners-client'), { 
  ssr: false,
  loading: () => <LoadingFallback />
});

// Create a simple loading component that matches the server-rendered structure
function LoadingFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Loading banner management interface...</p>
    </div>
  );
}

export default function AdminBanners() {
  // Wrap with Suspense as an extra layer of protection
  return (
    <Layout title="Admin Banners">
      <Suspense fallback={<LoadingFallback />}>
        <AdminBannersClient />
      </Suspense>
    </Layout>
  );
} 