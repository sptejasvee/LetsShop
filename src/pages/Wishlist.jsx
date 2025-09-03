import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart, FiTrash2 } from 'react-icons/fi';

const Wishlist = () => {
    const { 
        wishlist, 
        products, 
        toggleWishlist, 
        addToCart, 
        isInWishlist,
        isWishlistLoading,
        currency 
    } = useContext(ShopContext);
    const [wishlistProducts, setWishlistProducts] = useState([]);

    useEffect(() => {
        // Filter products that are in the wishlist
        const filteredProducts = products.filter(product => 
            wishlist.includes(product._id)
        );
        setWishlistProducts(filteredProducts);
    }, [wishlist, products]);

    if (wishlist.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <div className="max-w-md mx-auto">
                    <FiHeart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-6">You haven't added any items to your wishlist yet.</p>
                    <Link 
                        to="/" 
                        className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {wishlistProducts.map((product) => (
                    <div key={product._id} className="bg-white rounded-lg shadow-sm overflow-hidden group relative">
                        <Link to={`/product/${product._id}`} className="block">
                            <div className="relative overflow-hidden pt-[125%] bg-gray-100">
                                <img
                                    src={product.image[0]}
                                    alt={product.name}
                                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/300x400?text=Product+Image';
                                    }}
                                />
                            </div>
                            <div className="p-4">
                                <h3 className="text-gray-900 font-medium text-sm md:text-base mb-1 line-clamp-2">
                                    {product.name}
                                </h3>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-lg font-bold text-gray-900">
                                        {currency}{product.price}
                                    </span>
                                </div>
                            </div>
                        </Link>
                        
                        <div className="absolute top-2 right-2 flex flex-col gap-2">
                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    if (!isWishlistLoading) {
                                        await toggleWishlist(product._id);
                                    }
                                }}
                                className={`p-2 rounded-full bg-white shadow-md transition-colors ${
                                    isInWishlist(product._id) 
                                        ? 'text-red-500' 
                                        : 'text-gray-400 hover:text-red-500'
                                } ${isWishlistLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                disabled={isWishlistLoading}
                                aria-label="Remove from wishlist"
                            >
                                <FiHeart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                            </button>
                            
                            <button
                                onClick={async (e) => {
                                    e.preventDefault();
                                    const size = product.sizes?.[0] || 'One Size';
                                    await addToCart(product._id, size);
                                }}
                                className="p-2 rounded-full bg-white shadow-md text-gray-700 hover:bg-black hover:text-white transition-colors"
                                aria-label="Add to cart"
                            >
                                <FiShoppingCart className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Wishlist;
