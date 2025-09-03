import React, { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { FaSpinner } from 'react-icons/fa';

const LatestCollection = () => {

    const { products, isProductsLoading } = useContext(ShopContext);
    const [latestProducts, setLatestProducts] = useState([]);

    useEffect(()=>{
        setLatestProducts(products.slice(0,10));
    },[products])

  return (
    <div className='my-10'>
      <div className='text-center py-8 text-3xl'>
          <Title text1={'LATEST'} text2={'COLLECTIONS'} />
          <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
            Explore our newest arrivals, featuring the latest trends and must-have products of the season. Stay ahead in style and innovation with our carefully curated latest collections—fresh, exciting, and just for you!
          </p>
      </div>

      {/* Rendering Products */}
      {isProductsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="flex flex-col items-center">
            <FaSpinner className="animate-spin text-4xl text-gray-600 mb-4" />
            <p className="text-gray-600">Loading products...</p>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
          {latestProducts.length > 0 ? (
            latestProducts.map((item, index) => (
              <ProductItem key={index} id={item._id} image={item.image} name={item.name} price={item.price} discount={item.discount} />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              No products available
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default LatestCollection
