import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ShopContext } from '../context/ShopContext';
import { assets } from '../assets/assets';
import RelatedProducts from '../components/RelatedProducts';
import axios from 'axios';

const Product = () => {
  const { productId } = useParams();
  const { 
    products, 
    currency,
    addToCart, 
    token, 
    submitReview, 
    backendUrl, 
    toggleWishlist, 
    isInWishlist, 
    isWishlistLoading 
  } = useContext(ShopContext);
  const [productData, setProductData] = useState(false)
  const [image, setImage] = useState('')
  const [size,setSize] = useState('')
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [userOrders, setUserOrders] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const userId = localStorage.getItem('userId');
  const userReview = reviews.find(r => r.userId === userId);
  const avgRating = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : null;

  // Update wishlist status when product data or isInWishlist changes
  useEffect(() => {
    if (productData && productData._id) {
      setIsWishlisted(isInWishlist(productData._id));
    }
  }, [productData, isInWishlist]);

  // Fetch user orders to check if eligible to review
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        const res = await axios.post(backendUrl + '/api/order/userorders', {}, { headers: { token } });
        if (res.data.success) {
          setUserOrders(res.data.orders);
        }
      } catch (e) {}
    };
    fetchOrders();
  }, [token]);

  // Check if user can review this product
  useEffect(() => {
    if (!userOrders.length) return setCanReview(false);
    let delivered = false;
    userOrders.forEach(order => {
      if (order.status === 'Delivered') {
        order.items.forEach(item => {
          if (item._id === productId) delivered = true;
        });
      }
    });
    setCanReview(delivered);
  }, [userOrders, productId]);

  // Fetch product data and reviews
  const fetchProductData = async () => {
    const product = products.find(item => item._id === productId);
    if (product) {
      // Ensure we have the latest reviews from the product data
      const updatedProduct = {
        ...product,
        reviews: product.reviews || [],
        reviewCount: product.reviews?.length || 0,
        avgRating: product.reviews?.length 
          ? (product.reviews.reduce((a, b) => a + b.rating, 0) / product.reviews.length).toFixed(1)
          : 0
      };
      
      setProductData(updatedProduct);
      setImage(updatedProduct.image[0]);
      setReviews(updatedProduct.reviews);
    }
  }

  useEffect(() => {
    fetchProductData();
  }, [productId,products])

  // Handle review submit
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return alert('Please select a rating.');
    setSubmitting(true);
    const ok = await submitReview(productId, rating, feedback);
    setSubmitting(false);
    if (ok) {
      setEditMode(false);
      setRating(0);
      setFeedback('');
      fetchProductData(); // Refresh reviews
    }
  };

  if (!productData) {
    return <div className='opacity-0'></div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
      <div className='bg-white rounded-xl shadow-sm overflow-hidden'>
        {/* Product Details */}
        <div className='grid md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-8'>
          {/* Product Gallery */}
          <div className='flex flex-col md:flex-row gap-4'>
            {/* Thumbnails */}
            <div className='flex flex-row md:flex-col gap-2 order-2 md:order-1 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0 md:w-20'>
              {productData.image.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setImage(item)}
                  className={`flex-shrink-0 w-16 h-16 md:w-full md:h-20 rounded-md overflow-hidden border-2 ${
                    image === item ? 'border-orange-500' : 'border-transparent hover:border-gray-200'
                  } transition-colors`}
                >
                  <img 
                    src={item} 
                    alt={`Thumbnail ${index + 1}`}
                    className='w-full h-full object-cover'
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/100?text=Thumbnail';
                    }}
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className='relative w-full aspect-square bg-gray-50 rounded-lg overflow-hidden order-1 md:order-2'>
              <img 
                src={image} 
                alt={productData.name}
                className='w-full h-full object-contain p-4'
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/600?text=Product+Image';
                }}
              />
              {/* Discount Badge */}
              {productData.discount > 0 && (
                <span className='absolute top-3 right-3 bg-green-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full'>
                  -{productData.discount}% OFF
                </span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className='flex flex-col'>
            <div className='flex justify-between items-start mb-4'>
              <h1 className='text-3xl font-bold'>{productData.name}</h1>
              <button
                onClick={async () => {
                  if (!isWishlistLoading && productData._id) {
                    await toggleWishlist(productData._id);
                    setIsWishlisted(!isWishlisted);
                  }
                }}
                className={`p-2 rounded-full ${isWishlisted ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} ${isWishlistLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isWishlistLoading}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <svg 
                  className={`w-6 h-6 ${isWishlisted ? 'fill-current' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                  />
                </svg>
              </button>
            </div>
            <div className='flex items-center mb-6'>
              <div className='flex text-yellow-400 mr-2'>
                {[1, 2, 3, 4, 5].map((star) => (
                <svg 
                  key={star} 
                  className={`w-5 h-5 ${star <= Math.round(productData.avgRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                  viewBox='0 0 20 20'
                >
                  <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                </svg>
              ))}
              </div>
              <span className='text-gray-600'>({productData.reviewCount || 0} reviews) {productData.avgRating > 0 && `${productData.avgRating} out of 5`}</span>
            </div>

            {/* Price */}
            <div className='mt-4'>
              {productData.discount > 0 ? (
                <div className='flex items-baseline gap-3'>
                  <span className='text-3xl font-bold text-gray-900'>
                    {currency}{(productData.price - (productData.price * productData.discount / 100)).toFixed(2)}
                  </span>
                  <span className='text-lg text-gray-400 line-through'>{currency}{productData.price}</span>
                </div>
              ) : (
                <span className='text-3xl font-bold text-gray-900'>{currency}{productData.price}</span>
              )}
            </div>

            {/* Description */}
            <p className='mt-6 text-gray-600 leading-relaxed'>{productData.description}</p>

            {/* Sizes */}
            <div className='mt-8'>
              <h3 className='text-sm font-medium text-gray-900 mb-3'>Select Size</h3>
              <div className='flex flex-wrap gap-2'>
                {productData.sizes.map((item, index) => (
                  <button
                    key={index}
                    type='button'
                    onClick={() => setSize(item)}
                    className={`px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                      item === size
                        ? 'bg-black text-white border border-black'
                        : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to Cart */}
            <div className='mt-8 pt-6 border-t border-gray-200'>
              <button
                onClick={() => addToCart(productData._id, size)}
                disabled={!size}
                className={`w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                  size ? 'bg-black hover:bg-gray-800' : 'bg-gray-400 cursor-not-allowed'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors`}
              >
                {size ? 'ADD TO CART' : 'SELECT SIZE'}
              </button>
            </div>

            {/* Product Policies */}
            <div className='mt-6 pt-6 border-t border-gray-200'>
              <ul className='space-y-2 text-sm text-gray-600'>
                <li className='flex items-start'>
                  <svg className='h-5 w-5 text-green-500 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  <span>100% Original Products</span>
                </li>
                <li className='flex items-start'>
                  <svg className='h-5 w-5 text-green-500 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  <span>Cash on Delivery Available</span>
                </li>
                <li className='flex items-start'>
                  <svg className='h-5 w-5 text-green-500 mr-2' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                    <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 13l4 4L19 7' />
                  </svg>
                  <span>Easy 7-Day Returns & Exchanges</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

      {/* ---------- Description & Review Section ------------- */}
      <div className='px-6 pb-8 md:px-8'>
        <div className='border-b border-gray-200'>
          <nav className='-mb-px flex space-x-8'>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                !editMode
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setEditMode(false)}
              type="button"
            >
              Description
            </button>
            <button
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                editMode
                  ? 'border-black text-black'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
              onClick={() => setEditMode(true)}
              type="button"
            >
              Reviews ({reviews.length})
            </button>
          </nav>
        </div>

        <div className='py-8'>
          {!editMode ? (
            <div className='prose max-w-none'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>Product Details</h3>
              <p className='text-gray-600'>{productData.description}</p>
              
              <h3 className='text-lg font-medium text-gray-900 mt-8 mb-4'>Features</h3>
              <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                <li>High-quality materials for lasting durability</li>
                <li>Designed for ultimate comfort and style</li>
                <li>Perfect for various occasions</li>
                <li>Available in multiple sizes and colors</li>
              </ul>
              
              <h3 className='text-lg font-medium text-gray-900 mt-8 mb-4'>Care Instructions</h3>
              <ul className='list-disc pl-5 space-y-2 text-gray-600'>
                <li>Machine wash cold with like colors</li>
                <li>Tumble dry low or lay flat to dry</li>
                <li>Do not bleach</li>
                <li>Iron on low heat if needed</li>
              </ul>
            </div>
          ) : (
            <div className='space-y-8'>
              <div className='flex items-center'>
                {avgRating ? (
                  <div className='flex items-center'>
                    <div className='text-4xl font-bold text-gray-900 mr-4'>{avgRating}</div>
                    <div className='mr-4'>
                      <div className='flex items-center'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`h-5 w-5 ${
                              star <= Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill='currentColor'
                            viewBox='0 0 20 20'
                          >
                            <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                          </svg>
                        ))}
                      </div>
                      <p className='text-sm text-gray-500 mt-1'>Based on {reviews.length} review{reviews.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                ) : (
                  <p className='text-gray-600'>No reviews yet. Be the first to review this product!</p>
                )}
                
                {canReview && !userReview && !editMode && (
                  <button
                    onClick={() => setEditMode(true)}
                    className='ml-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black'
                  >
                    Write a Review
                  </button>
                )}
              </div>

              <div className='space-y-6'>
                {reviews.length === 0 ? (
                  <p className='text-gray-500 text-center py-8'>No reviews yet for this product.</p>
                ) : (
                  reviews.map((review, index) => (
                    <div key={index} className='border-b border-gray-200 pb-6 last:border-0 last:pb-0'>
                      <div className='flex items-center justify-between mb-2'>
                        <div className='flex items-center'>
                          <div className='flex'>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`h-5 w-5 ${
                                  star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                                fill='currentColor'
                                viewBox='0 0 20 20'
                              >
                                <path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z' />
                              </svg>
                            ))}
                          </div>
                          <span className='ml-2 text-sm text-gray-500'>
                            {review.date ? new Date(review.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            }) : ''}
                          </span>
                        </div>
                        {userId === review.userId && (
                          <button
                            onClick={() => {
                              setEditMode(true);
                              setRating(review.rating);
                              setFeedback(review.feedback || '');
                            }}
                            className='text-sm font-medium text-blue-600 hover:text-blue-500'
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      {review.feedback && (
                        <p className='text-gray-600 mt-2'>"{review.feedback}"</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Review Form: Only show if eligible and not already reviewed, or in edit mode */}
      {canReview && (!userReview && !editMode) && (
        <div className="px-6 pb-8 md:px-8">
          <form onSubmit={handleReviewSubmit} className='mt-4 flex flex-col gap-2 border-t pt-4'>
            <div className='flex items-center gap-2'>
              <label className='font-medium'>Your Rating:</label>
              {[1,2,3,4,5].map(star => (
                <button 
                  type='button' 
                  key={star} 
                  onClick={()=>setRating(star)} 
                  className={star <= rating ? 'text-yellow-500' : 'text-gray-300'} 
                  style={{fontSize:'2rem', lineHeight:'2rem'}}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              className='border p-2 rounded'
              placeholder='Write your feedback (optional)'
              value={feedback}
              onChange={e=>setFeedback(e.target.value)}
              rows={3}
              maxLength={1000}
            />
            <div className='flex gap-2'>
              <button 
                type='submit' 
                className='bg-black text-white px-4 py-2 rounded w-fit' 
                disabled={submitting}
              >
                {submitting ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Show user's review with edit button if not in edit mode */}
      {canReview && userReview && !editMode && (
        <div className='px-6 pb-8 md:px-8'>
          <div className='mt-4 border-t pt-4 text-green-700'>
            <div className='flex items-center gap-2'>
              <span className='font-semibold'>Your Review:</span>
              <span className='text-yellow-600'>{'★'.repeat(userReview.rating)}{'☆'.repeat(5-userReview.rating)}</span>
              <button 
                type="button"
                className='ml-2 text-xs text-blue-600 underline' 
                onClick={()=>{
                  setEditMode(true); 
                  setRating(userReview.rating); 
                  setFeedback(userReview.feedback || '');
                }}
              >
                Edit
              </button>
            </div>
            {userReview.feedback && <div className='italic'>{userReview.feedback}</div>}
          </div>
        </div>
      )}

      {!canReview && token && (
        <div className='text-xs text-gray-400 px-6 pb-8 md:px-8'>
          You can review this product after it is delivered.
        </div>
      )}

      {/* --------- display related products ---------- */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
      </div>
    </div>
  );
};

export default Product;
