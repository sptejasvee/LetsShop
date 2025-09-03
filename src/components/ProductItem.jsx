import React, { useState, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopContext } from '../context/ShopContext';
import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingBag, FiCheck, FiImage } from 'react-icons/fi';
import { getCloudinaryUrl } from '../utils/imageUtils';

const ProductItem = ({ id, image, name, price, discount, isNew = false, isBestseller = false }) => {
    const { 
        currency, 
        toggleWishlist, 
        isInWishlist, 
        isWishlistLoading,
        addToCart,
        toast
    } = useContext(ShopContext);
    
    const [isWishlisted, setIsWishlisted] = useState(isInWishlist(id));
    const [isHovered, setIsHovered] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [addedToCart, setAddedToCart] = useState(false);
    
    // Calculate final price if there's a discount
    const finalPrice = discount && discount > 0 
        ? (price - (price * discount / 100)).toFixed(2)
        : price;

    const handleWishlistClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await toggleWishlist(id);
            setIsWishlisted(!isWishlisted);
        } catch (error) {
            console.error('Error toggling wishlist:', error);
        }
    };

    const handleAddToCart = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (addedToCart) return;
        
        setIsAddingToCart(true);
        try {
            await addToCart(id, 'M'); // Default size 'M' for now
            setAddedToCart(true);
            
            // Show success message (handled by addToCart)
            
            // Reset after 2 seconds
            setTimeout(() => {
                setAddedToCart(false);
            }, 2000);
        } catch (error) {
            console.error('Error in handleAddToCart:', error);
            // Error message is handled by addToCart
        } finally {
            setIsAddingToCart(false);
        }
    };

    return (
        <motion.div 
            className="relative block overflow-hidden bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 h-full flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Link 
                to={`/product/${id}`}
                className="block h-full"
                onClick={() => window.scrollTo(0, 0)}
            >
                {/* Product Image */}
                <div className="relative overflow-hidden pt-[125%] bg-gray-100">
                    {/* Badges */}
                    <AnimatePresence>
                        <motion.div 
                            className="absolute top-3 left-3 z-10 flex flex-col space-y-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ staggerChildren: 0.1 }}
                        >
                            {isNew && (
                                <motion.span 
                                    className="bg-yellow-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    New
                                </motion.span>
                            )}
                            {isBestseller && (
                                <motion.span 
                                    className="bg-red-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    Bestseller
                                </motion.span>
                            )}
                            {discount > 0 && (
                                <motion.span 
                                    className="bg-green-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                >
                                    -{discount}%
                                </motion.span>
                            )}
                        </motion.div>
                    </AnimatePresence>
                    
                    {/* Wishlist Button */}
                    <motion.button 
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-colors ${
                            isWishlisted 
                                ? 'bg-red-100 text-red-500' 
                                : 'bg-white/80 text-gray-600 hover:bg-red-50 hover:text-red-500'
                        }`}
                        onClick={handleWishlistClick}
                        disabled={isWishlistLoading}
                        whileTap={{ scale: 0.9 }}
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                    >
                        <motion.div
                            key={isWishlisted ? 'filled' : 'outline'}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        >
                            <FiHeart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                        </motion.div>
                    </motion.button>
                    
                    {/* Product Image with Error Handling */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden bg-gray-50 flex items-center justify-center">
                        {useMemo(() => {
                            const imageUrl = Array.isArray(image) ? image[0] : image;
                            const imgSrc = getCloudinaryUrl(imageUrl, { width: 800, height: 1000 });
                            
                            return (
                                <motion.div 
                                    className="w-full h-full relative"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <motion.img 
                                        src={imgSrc}
                                        alt={name}
                                        className="w-full h-full object-cover"
                                        initial={{ scale: 1 }}
                                        animate={{ scale: isHovered ? 1.05 : 1 }}
                                        transition={{ duration: 0.5, ease: 'easeInOut' }}
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextElementSibling.style.display = 'flex';
                                        }}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 hidden">
                                        <FiImage className="w-12 h-12 text-gray-400" />
                                    </div>
                                </motion.div>
                            );
                        }, [image, name, isHovered])}
                    </div>
                    
                    {/* Add to Cart Button */}
                    <motion.div 
                        className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ 
                            opacity: isHovered ? 1 : 0, 
                            y: isHovered ? 0 : 20 
                        }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.button
                            className={`w-full py-2 px-4 rounded-md text-sm font-medium flex items-center justify-center space-x-2 ${
                                addedToCart 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-white text-gray-900 hover:bg-gray-100'
                            }`}
                            onClick={handleAddToCart}
                            disabled={isAddingToCart || addedToCart}
                            whileTap={!addedToCart ? { scale: 0.95 } : {}}
                        >
                            {addedToCart ? (
                                <>
                                    <FiCheck className="w-4 h-4" />
                                    <span>Added</span>
                                </>
                            ) : (
                                <>
                                    <FiShoppingBag className="w-4 h-4" />
                                    <span>Add to Cart</span>
                                </>
                            )}
                        </motion.button>
                    </motion.div>
                </div>
                
                {/* Product Info */}
                <div className="p-4 flex-grow flex flex-col">
                    <h3 className="text-gray-900 font-medium mb-1 line-clamp-2">{name}</h3>
                    <div className="mt-auto">
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center space-x-2">
                                <motion.span 
                                    className="text-lg font-bold text-gray-900"
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    {currency}{finalPrice}
                                </motion.span>
                                {discount > 0 && (
                                    <motion.span 
                                        className="text-sm text-gray-500 line-through"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                    >
                                        {currency}{price}
                                    </motion.span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};

export default ProductItem;
