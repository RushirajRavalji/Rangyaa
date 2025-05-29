import { useState, useEffect } from 'react';
import { GetStaticProps, GetStaticPaths } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaRegHeart, FaShoppingCart, FaCheck, FaRuler } from 'react-icons/fa';
import Layout from '../../components/Layout';
import ProductReviews from '../../components/ProductReviews';
import SizeGuide from '../../components/SizeGuide';
import { products, Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import styles from '../../styles/ProductDetail.module.css';

// Sample reviews for demonstration
const sampleReviews = [
  {
    id: 'review-1',
    name: 'Rahul Sharma',
    rating: 5,
    comment: 'These jeans are amazing! Perfect fit and very comfortable. The material is high quality and the color is exactly as shown in the pictures.',
    date: '2023-07-15'
  },
  {
    id: 'review-2',
    name: 'Priya Patel',
    rating: 4,
    comment: 'Great product, very comfortable and stylish. The only reason I\'m giving 4 stars is because the delivery took a bit longer than expected.',
    date: '2023-06-22'
  },
  {
    id: 'review-3',
    name: 'Amit Singh',
    rating: 5,
    comment: 'Excellent quality jeans. This is my second pair from this brand and I\'m very satisfied with both. Will definitely buy more in the future.',
    date: '2023-05-30'
  }
];

interface ProductPageProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductPage({ product, relatedProducts }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes && product.sizes.length > 0 ? product.sizes[0] : '');
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors && product.colors.length > 0 ? product.colors[0].name : '');
  const [selectedImage, setSelectedImage] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  
  // Calculate discount percentage properly
  const discountPercent = product?.originalPrice && product?.price 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Reset the added to cart status after 3 seconds
  useEffect(() => {
    if (addedToCart) {
      const timer = setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [addedToCart]);

  const handleAddToCart = () => {
    if (product.stock > 0 && selectedSize) {
      addToCart(product, quantity);
      setAddedToCart(true);
      if (typeof window !== 'undefined' && window.showNotification) {
        window.showNotification(`${product.name} added to cart`);
      }
    }
  };

  const toggleSizeGuide = () => {
    setShowSizeGuide(!showSizeGuide);
  };

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
          <div className={styles.breadcrumb}>
            <Link href="/">Home</Link>
            <span>/</span>
            <Link href={`/men/${product.category}`}>{product.category.toUpperCase()}</Link>
            <span>/</span>
            <span>{product.name}</span>
          </div>
          
          <div className={styles.productContainer}>
            <div className={styles.productImageContainer}>
              <div className={styles.productImage}>
                <Image
                  src={product.gallery ? product.gallery[selectedImage] : product.image}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover' }}
                  priority
                />
                {discountPercent > 0 && (
                  <span className={styles.discountBadge}>-{discountPercent}%</span>
                )}
                {product.new && (
                  <span className={styles.newBadge}>New</span>
                )}
              </div>
              
              {/* Image gallery thumbnails */}
              {product.gallery && product.gallery.length > 1 && (
                <div className={styles.thumbnailGallery}>
                  {product.gallery.map((image, index) => (
                    <div 
                      key={index} 
                      className={`${styles.thumbnail} ${selectedImage === index ? styles.active : ''}`}
                      onClick={() => setSelectedImage(index)}
                    >
                      <Image 
                        src={image} 
                        alt={`${product.name} - Image ${index + 1}`}
                        width={80}
                        height={80}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className={styles.productInfo}>
              <div className={styles.productCategory}>{product.category.toUpperCase()}</div>
              <h1>{product.name}</h1>
              
              {product.rating && (
                <div className={styles.productRating}>
                  {[...Array(5)].map((_, index) => (
                    <span key={index} className={index < Math.floor(product.rating || 0) ? styles.filledStar : styles.emptyStar}>
                      ★
                    </span>
                  ))}
                  <span className={styles.reviewCount}>({product.reviews} reviews)</span>
                </div>
              )}
              
              <div className={styles.productPrice}>
                {product.originalPrice && (
                  <span className={styles.originalPrice}>₹{product.originalPrice.toLocaleString()}</span>
                )}
                <span className={styles.salePrice}>₹{product.price.toLocaleString()}</span>
              </div>
              
              <div className={styles.stockStatus}>
                <span className={product.stock > 0 ? styles.inStock : styles.outOfStock}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                </span>
              </div>
              
              <div className={styles.productDescription}>
                <p>{product.description}</p>
              </div>
              
              <div className={styles.productOptions}>
                {product.sizes && product.sizes.length > 0 && (
                  <div className={styles.sizeSelection}>
                    <div className={styles.sizeHeader}>
                      <h3>Select Size</h3>
                      <button 
                        className={styles.sizeGuideButton}
                        onClick={toggleSizeGuide}
                        type="button"
                      >
                        <FaRuler /> Size Guide
                      </button>
                    </div>
                    <div className={styles.sizeOptions}>
                      {product.sizes.map(size => (
                        <button 
                          key={size} 
                          className={`${styles.sizeOption} ${selectedSize === size ? styles.active : ''}`}
                          onClick={() => setSelectedSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                {product.colors && product.colors.length > 0 && (
                  <div className={styles.colorSelection}>
                    <h3>Select Color</h3>
                    <div className={styles.colorOptions}>
                      {product.colors.map(color => (
                        <button 
                          key={color.name} 
                          className={`${styles.colorOption} ${selectedColor === color.name ? styles.active : ''}`}
                          style={{ backgroundColor: color.code }}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                        />
                      ))}
                    </div>
                    {selectedColor && <p className={styles.selectedColorName}>{selectedColor}</p>}
                  </div>
                )}
                
                <div className={styles.quantitySelector}>
                  <h3>Quantity</h3>
                  <div className={styles.quantityControl}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => setQuantity(prev => (prev > 1 ? prev - 1 : 1))}
                      disabled={quantity <= 1}
                    >
                      -
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => setQuantity(prev => Math.min(prev + 1, product.stock))}
                      disabled={quantity >= product.stock}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
              
              <div className={styles.productActions}>
                <button 
                  className={`${styles.addToCartBtn} ${addedToCart ? styles.added : ''}`}
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || !selectedSize}
                >
                  {addedToCart ? (
                    <>
                      <FaCheck /> Added to Cart
                    </>
                  ) : product.stock > 0 ? (
                    <>
                      <FaShoppingCart /> Add to Cart
                    </>
                  ) : (
                    'Out of Stock'
                  )}
                </button>
                
                <button 
                  className={`${styles.wishlistBtn} ${isInWishlist(product.id) ? styles.active : ''}`}
                  onClick={() => toggleWishlist(product)}
                >
                  {isInWishlist(product.id) ? <FaHeart /> : <FaRegHeart />}
                  {isInWishlist(product.id) ? ' Remove from Wishlist' : ' Add to Wishlist'}
                </button>
              </div>
              
              <div className={styles.productMeta}>
                <p><strong>Category:</strong> {product.category.toUpperCase()}</p>
                <p><strong>SKU:</strong> {product.sku || product.id.toUpperCase()}</p>
                {product.tags && product.tags.length > 0 && (
                  <p><strong>Tags:</strong> {product.tags.join(', ')}</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Product Tabs */}
          <div className={styles.productTabs}>
            <div className={styles.tabsHeader}>
              <button 
                className={`${styles.tabButton} ${activeTab === 'description' ? styles.active : ''}`}
                onClick={() => setActiveTab('description')}
              >
                Description
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'details' ? styles.active : ''}`}
                onClick={() => setActiveTab('details')}
              >
                Additional Information
              </button>
              <button 
                className={`${styles.tabButton} ${activeTab === 'reviews' ? styles.active : ''}`}
                onClick={() => setActiveTab('reviews')}
              >
                Reviews ({product.reviews || sampleReviews.length})
              </button>
            </div>
            
            <div className={styles.tabContent}>
              {activeTab === 'description' && (
                <div className={styles.descriptionTab}>
                  <h3>Product Description</h3>
                  <p>{product.description}</p>
                  {product.longDescription && (
                    <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
                  )}
                </div>
              )}
              
              {activeTab === 'details' && (
                <div className={styles.detailsTab}>
                  <h3>Product Specifications</h3>
                  <table className={styles.specTable}>
                    <tbody>
                      <tr>
                        <th>Material</th>
                        <td>{product.material || 'Cotton, Polyester, Elastane'}</td>
                      </tr>
                      <tr>
                        <th>Fit</th>
                        <td>{product.fit || 'Regular Fit'}</td>
                      </tr>
                      <tr>
                        <th>Care Instructions</th>
                        <td>{product.careInstructions || 'Machine wash cold, Do not bleach, Tumble dry low'}</td>
                      </tr>
                      <tr>
                        <th>Country of Origin</th>
                        <td>{product.countryOfOrigin || 'India'}</td>
                      </tr>
                      {product.sizes && (
                        <tr>
                          <th>Available Sizes</th>
                          <td>{product.sizes.join(', ')}</td>
                        </tr>
                      )}
                      {product.colors && (
                        <tr>
                          <th>Available Colors</th>
                          <td>{product.colors.map(c => c.name).join(', ')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              
              {activeTab === 'reviews' && (
                <div className={styles.reviewsTab}>
                  <ProductReviews 
                    productId={product.id} 
                    initialReviews={sampleReviews} 
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className={`section ${styles.relatedProductsSection}`}>
          <div className="container">
            <div className={styles.sectionTitle}>
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
                    <div className={styles.relatedProductInfo}>
                      <div className={styles.relatedProductCategory}>{relProduct.category.toUpperCase()}</div>
                      <h3>{relProduct.name}</h3>
                      <p className={styles.relatedProductPrice}>₹{relProduct.price.toLocaleString()}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && (
        <SizeGuide 
          category={product.category} 
          onClose={() => setShowSizeGuide(false)}
        />
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