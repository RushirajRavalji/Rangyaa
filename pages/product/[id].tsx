import { useState } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Layout from '../../components/Layout';
import { products, Product } from '../../data/products';
import styles from '../../styles/ProductDetail.module.css';

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <Layout title="Product Not Found">
        <div className={styles.notFoundContainer}>
          <h1>Product Not Found</h1>
          <p>The product you are looking for does not exist.</p>
          <Link href="/" className={styles.backButton}>
            Back to Home
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${product.name} | Nikhil's Jeans`}
      description={`Shop ${product.name} at Nikhil's Jeans.`}
    >
      <div className={styles.productDetail}>
        <div className="container">
          <div className={styles.productContainer}>
            <div className={styles.productImage}>
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: 'cover' }}
                priority
              />
            </div>
            <div className={styles.productInfo}>
              <h1>{product.name}</h1>
              <div className={styles.productPrice}>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>₹{product.originalPrice}</span>
                )}
                <span className={styles.salePrice}>₹{product.price}</span>
              </div>
              <div className={styles.productDescription}>
                <p>
                  Experience premium quality with our signature {product.name.toLowerCase()}. Crafted from the finest materials
                  and designed for both comfort and style, this piece is a must-have for your wardrobe.
                </p>
              </div>
              <div className={styles.productOptions}>
                <div className={styles.sizeSelection}>
                  <h3>Select Size</h3>
                  <div className={styles.sizeOptions}>
                    {['S', 'M', 'L', 'XL', 'XXL'].map(size => (
                      <button key={size} className={styles.sizeOption}>
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                <div className={styles.quantitySelector}>
                  <h3>Quantity</h3>
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                    >
                      -
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => setQuantity(prev => prev + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.productActions}>
                <button className={styles.addToCartBtn}>Add to Cart</button>
              </div>
              <div className={styles.productMeta}>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>SKU:</strong> {product.id.toUpperCase()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={`section ${styles.relatedProductsSection}`}>
          <div className="container">
            <div className="section-header">
              <h2>You May Also Like</h2>
              <p>Customers who bought this item also purchased</p>
            </div>
            <div className={styles.relatedProductsGrid}>
              {relatedProducts.map(relProduct => (
                <div key={relProduct.id} className={styles.relatedProduct}>
                  <Link href={`/product/${relProduct.id}`} className={styles.relatedProductLink}>
                    <div className={styles.relatedProductImage}>
                      <Image
                        src={relProduct.image}
                        alt={relProduct.name}
                        fill
                        sizes="(max-width: 768px) 50vw, 25vw"
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                    <h3>{relProduct.name}</h3>
                    <p className={styles.relatedProductPrice}>₹{relProduct.price}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = products.map(product => ({
    params: { id: product.id },
  }));

  return {
    paths,
    fallback: false, // Show 404 for non-existent products
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const product = products.find(p => p.id === params?.id);
  
  // Get related products from the same category, excluding the current product
  const relatedProducts = product 
    ? products
        .filter(p => p.category === product.category && p.id !== product.id)
        .slice(0, 4) 
    : [];

  return {
    props: {
      product: product || null,
      relatedProducts,
    },
  };
}; 