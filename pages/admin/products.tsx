import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';
import Layout from '../../components/Layout';

// Completely disable SSR for this component
const AdminProductsClient = dynamic(() => import('./products-client'), { 
  ssr: false,
  loading: () => <LoadingFallback />
});

// Create a simple loading component that matches the server-rendered structure
function LoadingFallback() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>Loading product management interface...</p>
    </div>
  );
}

export default function AdminProducts() {
  // Wrap with Suspense as an extra layer of protection
  return (
    <Layout title="Admin Products">
      <Suspense fallback={<LoadingFallback />}>
        <AdminProductsClient />
      </Suspense>
    </Layout>
  );
} 