import { createContext, useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useToast } from './ToastContext';

export const ShopContext = createContext();

export const ShopContextProvider = (props) => {

    const currency = '$';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || '');
    const [wishlist, setWishlist] = useState([]);
    const [isWishlistLoading, setIsWishlistLoading] = useState(false);
    const [isProductsLoading, setIsProductsLoading] = useState(true);
    const navigate = useNavigate();


    const toast = useToast();

    const addToCart = async (itemId, size) => {
        if (!token) {
            toast.error('Please login to add items to cart');
            navigate('/login');
            return;
        }

        if (!size) {
            toast.error('Please select a size');
            return;
        }

        try {
            // First update in the backend
            const response = await axios.post(
                `${backendUrl}/api/cart/update`,
                { 
                    itemId, 
                    size, 
                    quantity: (cartItems[itemId]?.[size] || 0) + 1 
                },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            // If backend update is successful, update local state
            if (response.data?.success) {
                const updatedCart = response.data.cartData || {};
                setCartItems(updatedCart);
                toast.success('Item added to cart!');
            } else {
                throw new Error('Failed to update cart');
            }

        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        }
    }

    const getCartCount = () => {
        let totalCount = 0;
        for (const items in cartItems) {
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        totalCount += cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return totalCount;
    }

    const removeFromCart = async (itemId, size) => {
        try {
            let cartData = structuredClone(cartItems);
            if (cartData[itemId] && cartData[itemId][size] > 0) {
                cartData[itemId][size] -= 1;
                if (cartData[itemId][size] === 0) {
                    delete cartData[itemId][size];
                    if (Object.keys(cartData[itemId]).length === 0) {
                        delete cartData[itemId];
                    }
                }
                setCartItems(cartData);

                // If user is logged in, update cart in the backend
                if (token) {
                    await axios.post(
                        `${backendUrl}/api/cart/update`,
                        { productId: itemId, size, quantity: cartData[itemId]?.[size] || 0 },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                }

                toast.success('Item updated in cart');
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            toast.error('Failed to update cart');
        }
    };

    const updateQuantity = async (itemId, size, newQuantity) => {
        // Ensure quantity is a valid number
        const quantity = newQuantity === '' || isNaN(parseInt(newQuantity, 10)) ? 0 : parseInt(newQuantity, 10);
        
        try {
            // Create a fresh copy of the current cart
            const updatedCart = JSON.parse(JSON.stringify(cartItems));
            
            // If quantity is 0 or less, remove the item
            if (quantity <= 0) {
                if (updatedCart[itemId]) {
                    delete updatedCart[itemId][size];
                    // Remove the item entry if no more sizes
                    if (Object.keys(updatedCart[itemId]).length === 0) {
                        delete updatedCart[itemId];
                    }
                }
            } else {
                // Update quantity
                if (!updatedCart[itemId]) updatedCart[itemId] = {};
                updatedCart[itemId][size] = quantity;
            }
            
            // Optimistically update the UI
            setCartItems(updatedCart);

            // Sync with backend if user is logged in
            if (token) {
                const response = await axios.post(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, quantity: quantity <= 0 ? 0 : quantity },
                    { 
                        headers: { 
                            'Content-Type': 'application/json',
                            'token': token 
                        } 
                    }
                );
                
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Failed to update cart');
                }
            }
            
            return true;
            
        } catch (error) {
            console.error('Error updating cart:', error);
            // Revert to previous cart state on error
            setCartItems(prevCart => ({...prevCart}));
            toast.error(error.response?.data?.message || 'Failed to update cart');
            return false;
        }
    }

    const getCartAmount = () => {
        let totalAmount = 0;
        for (const items in cartItems) {
            let itemInfo = products.find((product) => product._id === items);
            for (const item in cartItems[items]) {
                try {
                    if (cartItems[items][item] > 0) {
                        let price = itemInfo.discount && itemInfo.discount > 0
                          ? itemInfo.price - (itemInfo.price * itemInfo.discount / 100)
                          : itemInfo.price;
                        totalAmount += price * cartItems[items][item];
                    }
                } catch (error) {

                }
            }
        }
        return Math.round(totalAmount);
    }

    const getProductsData = async () => {
        setIsProductsLoading(true);
        try {
            const response = await axios.get(backendUrl + '/api/product/list', {
                timeout: 30000 // 30-second timeout for slow Render cold starts
            });

            if (response.data && response.data.success) {
                setProducts(Array.isArray(response.data.products) ? response.data.products.reverse() : []);
            } else {
                const errorMsg = response.data?.message || 'An unknown error occurred while fetching products.';
                toast.error(errorMsg);
                setProducts([]); // Clear products on failure
            }
        } catch (error) {
            console.error('Network or Server Error fetching products:', {
                message: error.message,
                isTimeout: error.code === 'ECONNABORTED',
                response: error.response?.data,
                config: {
                    url: error.config?.url,
                    method: error.config?.method
                }
            });

            let toastMessage = 'Failed to connect to the server. Please try again later.';
            if (error.code === 'ECONNABORTED') {
                toastMessage = 'Server took too long to respond. Please refresh the page.';
            }
            toast.error(toastMessage);
            setProducts([]); // Clear products on failure
        } finally {
            setIsProductsLoading(false);
        }
    };

    const getUserCart = async ( token ) => {
        try {
            
            const response = await axios.post(backendUrl + '/api/cart/get',{},{headers:{token}})
            if (response.data.success) {
                setCartItems(response.data.cartData)
            }
        } catch (error) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const submitReview = async (productId, rating, feedback) => {
        if (!token) {
            toast.error('You must be logged in to submit a review.');
            return false;
        }
        try {
            const response = await axios.post(backendUrl + '/api/product/review', {
                productId,
                rating: Number(rating),
                feedback
            }, { headers: { token } });
            if (response.data.success) {
                toast.success('Review submitted!');
                getProductsData(); // Refresh products to get new reviews
                return true;
            } else {
                toast.error(response.data.message);
                return false;
            }
        } catch (error) {
            toast.error(error.message);
            return false;
        }
    }

    // Load initial data
    useEffect(() => {
        // Load token from localStorage if exists
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
        }
        
        // Load initial products
        getProductsData();
        
        // Load wishlist from localStorage if exists
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
            try {
                const parsedWishlist = JSON.parse(storedWishlist);
                setWishlist(parsedWishlist);
            } catch (error) {
                console.error('Error parsing wishlist from localStorage:', error);
                localStorage.removeItem('wishlist');
            }
        }
    }, [])

    useEffect(() => {
        const fetchUserData = async () => {
            if (token) {
                try {
                    // Fetch cart data
                    const cartRes = await axios.post(
                        `${backendUrl}/api/cart/get`, 
                        { userId: localStorage.getItem('userId') }, 
                        { 
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            } 
                        }
                    );
                    if (cartRes.data.success) {
                        setCartItems(cartRes.data.cartData || {});
                    }
                    
                    // Fetch wishlist data
                    const userId = localStorage.getItem('userId');
                    if (userId) {
                        const wishlistRes = await axios.get(`${backendUrl}/api/wishlist/${userId}`, { 
                            headers: { 
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            } 
                        });
                        if (wishlistRes.data.success) {
                            setWishlist(wishlistRes.data.wishlist || []);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            } else {
                setCartItems({});
                setWishlist([]);
            }
        };
        fetchUserData();
    }, [token]);

    useEffect(() => {
        if (!token && localStorage.getItem('token')) {
            setToken(localStorage.getItem('token'))
            const fetchUserData = async () => {
                if (localStorage.getItem('token')) {
                    try {
                        // Fetch cart data
                        const cartRes = await axios.post(backendUrl + '/api/cart/get', {}, { headers: { token: localStorage.getItem('token') } });
                        if (cartRes.data.success) {
                            setCartItems(cartRes.data.cartData || {});
                        }
                        
                        // Fetch wishlist data
                        const userId = localStorage.getItem('userId');
                        if (userId) {
                            const wishlistRes = await axios.get(
                                `${backendUrl}/api/wishlist`,
                                { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } }
                            );
                            if (wishlistRes.data.success) {
                                setWishlist(wishlistRes.data.wishlist || []);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching user data:', error);
                    }
                } else {
                    setCartItems({});
                    setWishlist([]);
                }
            };
            fetchUserData();
        }
    }, []);

    const toggleWishlist = async (productId) => {
        if (!token) {
            navigate('/login');
            toast.warning('Please login to manage your wishlist');
            return;
        }

        const isInWishlist = wishlist.includes(productId);
        
        try {
            setIsWishlistLoading(true);
            
            if (isInWishlist) {
                await removeFromWishlist(productId);
            } else {
                await addToWishlist(productId);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);
            toast.error('Failed to update wishlist');
        } finally {
            setIsWishlistLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        try {
            // Update local state first for immediate UI update
            const updatedWishlist = [...wishlist, productId];
            setWishlist(updatedWishlist);
            localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
            
            // Then sync with backend if user is logged in
            if (token) {
                const response = await axios.post(
                    `${backendUrl}/api/wishlist/add`,
                    { productId },
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );
                // Ensure local state matches backend
                if (response.data.success) {
                    setWishlist(response.data.wishlist || updatedWishlist);
                    localStorage.setItem('wishlist', JSON.stringify(response.data.wishlist || updatedWishlist));
                }
            }
            
            toast.success('Added to your wishlist');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
            toast.error(errorMessage);
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setToken('');
                navigate('/login');
            }
            throw error;
        }
    };

    const removeFromWishlist = async (productId) => {
        try {
            // Update local state first for immediate UI update
            const updatedWishlist = wishlist.filter(id => id !== productId);
            setWishlist(updatedWishlist);
            localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
            
            // Then sync with backend if user is logged in
            if (token) {
                const response = await axios.post(
                    `${backendUrl}/api/wishlist/remove`,
                    { productId },
                    { 
                        headers: { 
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        } 
                    }
                );
                // Ensure local state matches backend
                if (response.data.success) {
                    setWishlist(response.data.wishlist || updatedWishlist);
                    localStorage.setItem('wishlist', JSON.stringify(response.data.wishlist || updatedWishlist));
                }
            }
            
            toast.success('Removed from your wishlist');
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            const errorMessage = error.response?.data?.message || 'Failed to remove from wishlist';
            toast.error(errorMessage);
            
            if (error.response?.status === 401) {
                localStorage.removeItem('token');
                setToken('');
                navigate('/login');
            }
            throw error;
        }
    };

    const isInWishlist = (productId) => {
        return wishlist.includes(productId);
    };

    const getTotalCartItems = () => {
        return getCartCount(); // Reuse existing getCartCount function
    };

    const getTotalCartAmount = () => {
        return getCartAmount(); // Reuse existing getCartAmount function
    };

    const clearCart = async () => {
        try {
            if (token) {
                await axios.post(backendUrl + '/api/cart/clear', {}, { headers: { token } });
            }
            setCartItems({});
        } catch (error) {
            console.error('Error clearing cart:', error);
            toast.error(error.response?.data?.message || 'Failed to clear cart');
        }
    };

    const checkout = async (orderData) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/order/create',
                orderData,
                { headers: { token } }
            );
            if (response.data.success) {
                await clearCart();
                return { success: true, order: response.data.order };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Checkout error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Checkout failed. Please try again.' 
            };
        }
    };

    const getProductQuantity = (productId, size) => {
        return cartItems[productId]?.[size] || 0;
    };

    const login = async (email, password) => {
        try {
            const response = await axios.post(backendUrl + '/api/user/login', { email, password });
            if (response.data.success) {
                const { token, userId, email: userEmail } = response.data;
                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);
                localStorage.setItem('userEmail', userEmail || email);
                setToken(token);
                setUserEmail(userEmail || email);
                
                // Fetch user's cart and wishlist
                const [cartRes, wishlistRes] = await Promise.all([
                    axios.post(backendUrl + '/api/cart/get', {}, { headers: { token } }),
                    axios.get(
                        `${backendUrl}/api/wishlist`,
                        { headers: { 'Authorization': `Bearer ${token}` } }
                    )
                ]);
                
                if (cartRes.data.success) {
                    setCartItems(cartRes.data.cartData || {});
                }
                
                let mergedWishlist = [];
                const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
                
                if (wishlistRes.data.success) {
                    // Merge server wishlist with local wishlist, removing duplicates
                    mergedWishlist = [...new Set([...localWishlist, ...(wishlistRes.data.wishlist || [])])];
                    setWishlist(mergedWishlist);
                    localStorage.setItem('wishlist', JSON.stringify(mergedWishlist));
                    
                    // Sync merged wishlist back to server
                    await Promise.all(
                        localWishlist
                            .filter(id => !wishlistRes.data.wishlist?.includes(id))
                            .map(id => 
                                axios.post(
                                    `${backendUrl}/api/wishlist/add`,
                                    { productId: id },
                                    { headers: { 'Authorization': `Bearer ${token}` } }
                                )
                            )
                    );
                } else {
                    // If we can't get server wishlist, use local one
                    setWishlist(localWishlist);
                }
                
                return { success: true };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed. Please try again.' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        setToken('');
        setUserEmail('');
        setCartItems({});
        setWishlist([]);
    }

    const contextValue = {
        products,
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getTotalCartAmount,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        clearCart,
        checkout,
        token,
        setToken,
        login,
        userEmail,
        logout,
        getProductQuantity,
        toggleWishlist,
        isInWishlist,
        wishlist,
        isWishlistLoading,
        isProductsLoading,
        backendUrl,
        navigate,
        submitReview,
        getCartAmount,
        getCartCount,
        currency,
        delivery_fee
    };

    return (
        <ShopContext.Provider value={contextValue}>
            {props.children}
        </ShopContext.Provider>
    )

}

export default ShopContextProvider;