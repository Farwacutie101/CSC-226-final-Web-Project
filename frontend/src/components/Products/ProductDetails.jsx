import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { fetchProductDetails, fetchSimilarProducts } from '../../redux/slices/productsSlice';
import axios from 'axios';
import { toast } from 'sonner';

const ProductDetails = ({ productId }) => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { selectedProduct } = useSelector((state) => state.products);

  const [mainImage, setMainImage] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState('');
  const [comment, setComment] = useState('');

  const productFetchId = productId || id;

  useEffect(() => {
    if (productFetchId && /^[a-fA-F0-9]{24}$/.test(productFetchId)) {
      dispatch(fetchProductDetails(productFetchId));
      dispatch(fetchSimilarProducts(productFetchId));
    } else {
      console.error('Invalid product ID:', productFetchId);
    }
  }, [productFetchId, dispatch]);

  useEffect(() => {
    if (selectedProduct?.images?.length > 0) {
      setMainImage(selectedProduct.images[0].url);
    } else {
      setMainImage(null);
    }
  }, [selectedProduct]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`/api/reviews/${productFetchId}`);
        setReviews(data);
      } catch (error) {
        console.error('Failed to load reviews:', error);
      }
    };
    fetchReviews();
  }, [productFetchId]);

  const handleQuantityChange = (action) => {
    if (action === 'plus') setQuantity((prev) => prev + 1);
    if (action === 'minus' && quantity > 1) setQuantity((prev) => prev - 1);
  };

  const handleAddToCart = () => {
    if (!selectedSize || !selectedColor) {
      toast.error('Please select size and color before adding to cart.', { duration: 1000 });
      return;
    }
    setIsButtonDisabled(true);

    dispatch(
      addToCart({
        productId: productFetchId,
        quantity,
        size: selectedSize,
        color: selectedColor,
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('You must be logged in to leave a review.');
      return;
    }

    try {
      await axios.post('/api/reviews', {
        productId: productFetchId,
        user: user._id,
        rating,
        comment
      });

      alert('Review submitted!');
      setRating('');
      setComment('');

      const { data } = await axios.get(`/api/reviews/${productFetchId}`);
      setReviews(data);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Could not submit review');
    }
  };

  return (
    <div style={{ padding: '1rem' }}>
      {/* Replace this with your actual product details layout */}
      <h2>{selectedProduct?.name}</h2>
      <img src={mainImage} alt={selectedProduct?.name} width={200} />
      <p>{selectedProduct?.description}</p>

      {/* Review Section */}
      <div style={{ marginTop: '2rem' }}>
        <h3>⭐ Customer Reviews</h3>
        {reviews.length === 0 && <p>No reviews yet.</p>}
        <ul>
          {Array.isArray(reviews) && reviews.map((review) => (

            <li key={review._id} style={{ marginBottom: '1rem', borderBottom: '1px solid #ccc' }}>
              <p><strong>User:</strong> {review.user?.name || 'Anonymous'}</p>
              <p><strong>Rating:</strong> {'⭐'.repeat(review.rating)}</p>
              {review.comment && <p><strong>Comment:</strong> {review.comment}</p>}
              <p style={{ fontSize: '0.8rem', color: '#888' }}>
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>

        {/* Submit Review Form */}
        <div style={{ marginTop: '2rem' }}>
          <h4>📝 Leave a Review</h4>
          <form onSubmit={handleSubmit}>
            <label>
              Rating:
              <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                <option value="">Select...</option>
                {[1, 2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} Star{num > 1 && 's'}
                  </option>
                ))}
              </select>
            </label>
            <br />
            <label>
              Comment:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review here"
              />
            </label>
            <br />
            <button type="submit">Submit Review</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
