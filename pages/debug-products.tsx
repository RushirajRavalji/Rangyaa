import Layout from '../components/Layout';
import { useProducts } from '../context/ProductContext';
import styles from '../styles/Products.module.css';
import Link from 'next/link';
import Image from 'next/image';

export default function DebugProductsPage() {
  const { loading, error, products } = useProducts();
  
  // Find the product that appears to match the one in the image
  // Looking for a "Stretch Denim Skinny Jeans" product
  const denim = products.find(p => p.name.toLowerCase().includes('skinny jeans'));
  
  // Calculate all discounts
  const productsWithCalculatedDiscount = products.map(product => {
    let discount = product.discount || 0;
    
    // Calculate discount from price difference if not explicitly set
    if (!product.discount && product.originalPrice && product.price) {
      discount = Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      );
    }
    
    return {
      ...product,
      calculatedDiscount: discount
    };
  });

  return (
    <Layout title="Debug Products">
      <div className="container" style={{ padding: '80px 20px' }}>
        <h1>Product Discount Debugger</h1>
        
        {loading ? (
          <div>Loading products...</div>
        ) : error ? (
          <div>Error loading products: {error}</div>
        ) : (
          <div>
            <h2>Potential Product from Image:</h2>
            {denim ? (
              <div className="debug-product">
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                  <div style={{ width: '200px', height: '200px', position: 'relative' }}>
                    <Image 
                      src={denim.image} 
                      alt={denim.name}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                  <div>
                    <h3>{denim.name}</h3>
                    <p>Category: {denim.category}</p>
                    <p>Price: ₹{denim.price}</p>
                    {denim.originalPrice && <p>Original Price: ₹{denim.originalPrice}</p>}
                    <p>Has 'discount' property: {denim.discount !== undefined ? 'Yes' : 'No'}</p>
                    {denim.discount && <p>Explicit discount: {denim.discount}%</p>}
                    
                    {denim.originalPrice && (
                      <p>
                        Calculated discount: 
                        {Math.round(((denim.originalPrice - denim.price) / denim.originalPrice) * 100)}%
                      </p>
                    )}
                    
                    <p>
                      <strong>Should appear in sale section: </strong>
                      {(denim.discount && denim.discount >= 40) || 
                       (denim.originalPrice && 
                        ((denim.originalPrice - denim.price) / denim.originalPrice * 100) >= 40) ? 
                        'Yes' : 'No'}
                    </p>
                    
                    <p>Is "New": {denim.new ? 'Yes' : 'No'}</p>
                  </div>
                </div>
                
                <pre style={{ background: '#f5f5f5', padding: '10px', overflowX: 'auto' }}>
                  {JSON.stringify(denim, null, 2)}
                </pre>
              </div>
            ) : (
              <p>No product that matches "Stretch Denim Skinny Jeans" was found.</p>
            )}
            
            <h2>All Products with Calculated Discounts:</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Name</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Price</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Original</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Explicit Discount</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Calculated</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>In Sale?</th>
                </tr>
              </thead>
              <tbody>
                {productsWithCalculatedDiscount.map(product => (
                  <tr key={product.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{product.name}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>₹{product.price}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {product.originalPrice ? `₹${product.originalPrice}` : '-'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {product.discount ? `${product.discount}%` : '-'}
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {product.calculatedDiscount}%
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {product.calculatedDiscount >= 40 ? 'Yes' : 'No'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ marginTop: '20px' }}>
              <h3>Fix Solutions:</h3>
              <ol>
                <li>
                  <strong>Update Product Data:</strong> Add the explicit discount field to products, especially 
                  the "Stretch Denim Skinny Jeans" product (set discount: 47)
                </li>
                <li>
                  <strong>Use the Sale Page Solution:</strong> The updated Sale page now includes both 
                  explicit and implicit discounts (calculating from original and current prices)
                </li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 