import { useState } from 'react';
import { FaStar, FaRegStar, FaUser } from 'react-icons/fa';
import styles from '../styles/ProductReviews.module.css';

interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

interface ProductReviewsProps {
  productId: string;
  initialReviews?: Review[];
}

const ProductReviews = ({ productId, initialReviews = [] }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [newReview, setNewReview] = useState({
    name: '',
    rating: 0,
    comment: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formErrors, setFormErrors] = useState({
    name: '',
    rating: '',
    comment: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleRatingChange = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewReview(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {
      name: '',
      rating: '',
      comment: '',
    };
    let isValid = true;

    if (!newReview.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    if (newReview.rating === 0) {
      errors.rating = 'Please select a rating';
      isValid = false;
    }

    if (!newReview.comment.trim()) {
      errors.comment = 'Please write a review';
      isValid = false;
    } else if (newReview.comment.length < 10) {
      errors.comment = 'Review must be at least 10 characters';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call to submit review
    setTimeout(() => {
      const newReviewObject: Review = {
        id: `review-${Date.now()}`,
        name: newReview.name,
        rating: newReview.rating,
        comment: newReview.comment,
        date: new Date().toISOString().split('T')[0],
      };

      setReviews(prev => [newReviewObject, ...prev]);
      setNewReview({ name: '', rating: 0, comment: '' });
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1000);
  };

  // Calculate average rating
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  return (
    <div className={styles.reviewsContainer}>
      <h2 className={styles.reviewsTitle}>Customer Reviews</h2>
      
      {reviews.length > 0 ? (
        <div className={styles.reviewsSummary}>
          <div className={styles.averageRating}>
            <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
            <div className={styles.stars}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.floor(averageRating) ? (
                    <FaStar className={styles.filledStar} />
                  ) : (
                    <FaRegStar className={styles.emptyStar} />
                  )}
                </span>
              ))}
            </div>
            <span className={styles.reviewCount}>Based on {reviews.length} reviews</span>
          </div>
        </div>
      ) : (
        <p className={styles.noReviews}>This product has no reviews yet. Be the first to leave a review!</p>
      )}

      <div className={styles.reviewsList}>
        {reviews.map(review => (
          <div key={review.id} className={styles.reviewItem}>
            <div className={styles.reviewHeader}>
              <div className={styles.reviewerInfo}>
                <FaUser className={styles.userIcon} />
                <span className={styles.reviewerName}>{review.name}</span>
                <span className={styles.reviewDate}>{review.date}</span>
              </div>
              <div className={styles.reviewRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star}>
                    {star <= review.rating ? (
                      <FaStar className={styles.filledStar} />
                    ) : (
                      <FaRegStar className={styles.emptyStar} />
                    )}
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.reviewContent}>
              <p>{review.comment}</p>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.writeReview}>
        <h3>Write a Review</h3>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Your Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={newReview.name}
              onChange={handleInputChange}
              placeholder="Enter your name"
              className={formErrors.name ? styles.inputError : ''}
            />
            {formErrors.name && <p className={styles.errorMessage}>{formErrors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <label>Your Rating</label>
            <div className={styles.ratingSelector}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => handleRatingChange(star)}
                  className={styles.ratingStar}
                >
                  {star <= (hoveredRating || newReview.rating) ? (
                    <FaStar className={styles.filledStar} />
                  ) : (
                    <FaRegStar className={styles.emptyStar} />
                  )}
                </span>
              ))}
            </div>
            {formErrors.rating && <p className={styles.errorMessage}>{formErrors.rating}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="comment">Your Review</label>
            <textarea
              id="comment"
              name="comment"
              value={newReview.comment}
              onChange={handleInputChange}
              placeholder="Write your review here..."
              rows={5}
              className={formErrors.comment ? styles.inputError : ''}
            />
            {formErrors.comment && <p className={styles.errorMessage}>{formErrors.comment}</p>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>

          {submitSuccess && (
            <div className={styles.successMessage}>
              Thank you! Your review has been submitted successfully.
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProductReviews; 