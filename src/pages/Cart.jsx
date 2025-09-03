import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import { assets } from '../assets/assets';
import CartTotal from '../components/CartTotal';

const Cart = () => {
  const { products, currency, cartItems, updateQuantity, navigate } = useContext(ShopContext);
  const [cartData, setCartData] = useState([]);

  useEffect(() => {
    if (products.length > 0) {
      const tempData = [];
      for (const items in cartItems) {
        for (const item in cartItems[items]) {
          if (cartItems[items][item] > 0) {
            tempData.push({
              _id: items,
              size: item,
              quantity: cartItems[items][item]
            });
          }
        }
      }
      setCartData(tempData);
    }
  }, [cartItems, products]);

  return (
    <div className='min-h-screen bg-gray-50 py-16 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-7xl mx-auto'>
        <div className='text-center mb-12'>
          <Title text1={'YOUR'} text2={'SHOPPING CART'} />
          {cartData.length === 0 && (
            <p className='mt-4 text-gray-500'>Your cart is empty. Start adding some products!</p>
          )}
        </div>

        <div className='bg-white rounded-lg shadow-md overflow-hidden mb-8'>
          {cartData.map((item, index) => {
            const productData = products.find((product) => product._id === item._id);
            if (!productData) return null;
            
            const price = productData.discount > 0 
              ? (productData.price - (productData.price * productData.discount / 100)).toFixed(2)
              : productData.price;

            return (
              <div key={index} className='p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors duration-200'>
                <div className='flex flex-col md:flex-row items-start md:items-center gap-6'>
                  <img 
                    className='w-24 h-24 object-cover rounded-lg border border-gray-200' 
                    src={productData.image[0]} 
                    alt={productData.name} 
                  />
                  
                  <div className='flex-1 w-full'>
                    <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                      <div>
                        <h3 className='text-lg font-semibold text-gray-800'>{productData.name}</h3>
                        <div className='flex items-center gap-3 mt-1'>
                          <span className='px-2 py-1 bg-gray-100 text-sm rounded-md'>{item.size}</span>
                          <div className='flex items-center gap-2'>
                            {productData.discount > 0 && (
                              <span className='text-sm text-gray-400 line-through'>${productData.price}</span>
                            )}
                            <span className='text-lg font-medium text-red-600'>${price}</span>
                            {productData.discount > 0 && (
                              <span className='text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full'>
                                {productData.discount}% OFF
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className='flex items-center gap-4'>
                        <div className='flex items-center border border-gray-200 rounded-md overflow-hidden'>
                          <button 
                            onClick={() => updateQuantity(item._id, item.size, Math.max(1, item.quantity - 1))}
                            className='px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors'
                          >
                            -
                          </button>
                          <input 
                            type='number' 
                            value={item.quantity}
                            onChange={(e) => {
                              const value = parseInt(e.target.value) || 1;
                              updateQuantity(item._id, item.size, Math.max(1, value));
                            }}
                            className='w-12 text-center border-0 focus:ring-0'
                            min='1'
                          />
                          <button 
                            onClick={() => updateQuantity(item._id, item.size, item.quantity + 1)}
                            className='px-3 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors'
                          >
                            +
                          </button>
                        </div>
                        
                        <button 
                          onClick={() => updateQuantity(item._id, item.size, 0)}
                          className='p-2 text-gray-400 hover:text-red-500 transition-colors'
                          aria-label='Remove item'
                        >
                          <img src={assets.bin_icon} alt='Remove' className='w-5 h-5' />
                        </button>
                      </div>
                    </div>
                    
                    <div className='mt-4 flex items-center justify-between'>
                      <span className='text-sm text-gray-500'>Subtotal:</span>
                      <span className='font-medium'>${(price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {cartData.length > 0 && (
          <div className='bg-white rounded-lg shadow-md p-6'>
            <CartTotal />
            <div className='mt-8 text-right'>
              <button 
                onClick={() => navigate('/place-order')} 
                className='bg-black hover:bg-gray-800 text-white font-medium py-3 px-8 rounded-md transition-colors duration-200 transform hover:scale-105'
              >
                PROCEED TO CHECKOUT
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
