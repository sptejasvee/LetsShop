import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';

const Orders = () => {
  const { backendUrl, token, currency, products, submitReview } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState({ 
    open: false, 
    product: null, 
    review: null 
  });
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const getStatusBadge = (status) => {
    const statusClasses = {
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Processing': 'bg-blue-100 text-blue-800',
      'Shipped': 'bg-indigo-100 text-indigo-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const loadOrderData = async () => {
    try {
      if (!token) return;
      
      setLoading(true);
      const response = await axios.post(
        `${backendUrl}/api/order/userorders`,
        {},
        { headers: { token } }
      );
      
      if (response.data.success) {
        const allOrdersItem = [];
        response.data.orders.forEach((order) => {
          order.items.forEach((item) => {
            allOrdersItem.push({
              ...item,
              status: order.status,
              payment: order.payment,
              paymentMethod: order.paymentMethod,
              date: order.date,
              orderId: order._id,
              orderAmount: order.amount,
              orderDate: order.createdAt
            });
          });
        });
        setOrderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserReview = (productId) => {
    const userId = localStorage.getItem('userId');
    const product = products.find(p => p._id === productId);
    return product?.reviews?.find(r => r.userId === userId) || null;
  };

  const openReviewModal = (productId) => {
    const review = getUserReview(productId);
    setReviewModal({ 
      open: true, 
      product: productId, 
      review 
    });
    setReviewRating(review ? review.rating : 0);
    setReviewFeedback(review ? review.feedback : '');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    
    setReviewSubmitting(true);
    const success = await submitReview(reviewModal.product, reviewRating, reviewFeedback);
    setReviewSubmitting(false);
    
    if (success) {
      setReviewModal({ open: false, product: null, review: null });
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  if (loading) {
    return (
      <div className='min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-12'>
            <Title text1={'MY'} text2={'ORDERS'} />
            <p className='mt-4 text-gray-500'>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <Title text1={'MY'} text2={'ORDER HISTORY'} />
          {orderData.length === 0 && !loading && (
            <p className='mt-4 text-gray-500'>You haven't placed any orders yet.</p>
          )}
        </div>

        <div className='space-y-6'>
          {orderData.map((item, index) => (
            <div 
              key={index} 
              className='bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200'
            >
              <div className='p-6'>
                <div className='flex flex-col lg:flex-row gap-6'>
                  {/* Product Image and Basic Info */}
                  <div className='flex-1'>
                    <div className='flex flex-col sm:flex-row gap-4'>
                      <img 
                        className='w-full sm:w-24 h-24 object-cover rounded-md border border-gray-200 flex-shrink-0' 
                        src={item.image[0]} 
                        alt={item.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://via.placeholder.com/96';
                        }}
                      />
                      <div className='flex-1 min-w-0'>
                        <h3 className='text-lg font-medium text-gray-900 truncate'>{item.name}</h3>
                        <div className='mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600'>
                          <div className='flex items-center'>
                            <span className='font-medium'>Qty:</span>
                            <span className='ml-1'>{item.quantity}</span>
                          </div>
                          <div className='flex items-center'>
                            <span className='font-medium'>Size:</span>
                            <span className='ml-1'>{item.size}</span>
                          </div>
                          <div className='mt-1 sm:mt-0'>
                            {getStatusBadge(item.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Order Meta */}
                  <div className='lg:w-64 xl:w-80 flex-shrink-0'>
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-1 lg:gap-2'>
                      <div>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Amount</p>
                        <p className='text-lg font-semibold text-gray-900 mt-0.5'>
                          {currency}{item.orderAmount?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Order Date</p>
                        <p className='text-sm text-gray-600 mt-0.5'>
                          {new Date(item.date || item.orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      <div>
                        <p className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Payment</p>
                        <div className='flex items-center mt-0.5'>
                          <span className={`text-sm capitalize ${item.payment === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                            {item.paymentMethod?.toLowerCase() || 'N/A'}
                          </span>
                          {item.payment && (
                            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${item.payment === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {item.payment}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Actions */}
                <div className='mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
                  <div className='text-sm text-gray-600'>
                    <div className='flex items-center'>
                      <span className='font-medium'>Order ID:</span>
                      <span className='ml-1.5 font-mono bg-gray-50 px-2 py-0.5 rounded text-gray-700'>
                        {item.orderId?.substring(0, 8)}...
                      </span>
                    </div>
                  </div>
                  
                  <div className='flex flex-wrap gap-3 w-full sm:w-auto justify-end'>
                    {item.status === 'Delivered' && !getUserReview(item._id) && (
                      <button
                        onClick={() => openReviewModal(item._id)}
                        className='px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors w-full sm:w-auto text-center'
                      >
                        Write a Review
                      </button>
                    )}
                    
                    {item.status === 'Delivered' && getUserReview(item._id) && (
                      <button
                        onClick={() => openReviewModal(item._id)}
                        className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center'
                      >
                        View Your Review
                      </button>
                    )}
                    
                    {['Processing', 'Shipped'].includes(item.status) && (
                      <button
                        onClick={() => {}}
                        className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 transition-colors w-full sm:w-auto text-center'
                      >
                        Track Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.open && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50'>
          <div className='bg-white rounded-lg w-full max-w-md p-6'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              {reviewModal.review ? 'Update Your Review' : 'Write a Review'}
            </h3>
            
            <form onSubmit={handleReviewSubmit}>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Rating
                </label>
                <div className='flex space-x-1'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type='button'
                      onClick={() => setReviewRating(star)}
                      className={`text-2xl ${star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div className='mb-4'>
                <label htmlFor='feedback' className='block text-sm font-medium text-gray-700 mb-2'>
                  Your Review
                </label>
                <textarea
                  id='feedback'
                  rows='4'
                  className='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-black focus:border-black'
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder='Share your thoughts about this product...'
                />
              </div>
              
              <div className='flex justify-end space-x-3'>
                <button
                  type='button'
                  onClick={() => setReviewModal({ open: false, product: null, review: null })}
                  className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50'
                  disabled={reviewSubmitting}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-4 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 disabled:opacity-50'
                  disabled={reviewSubmitting || !reviewRating}
                >
                  {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
