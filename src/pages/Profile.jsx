import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShopContext } from '../context/ShopContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from 'jwt-decode';
import { FiEdit2, FiSave, FiX, FiUser, FiMail, FiShoppingBag, FiHeart } from 'react-icons/fi';

const Profile = () => {
  const { token, backendUrl, userEmail, wishlist } = useContext(ShopContext);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(`${backendUrl}/api/user/me`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        
        if (response.data?.success && response.data.user) {
          const { user } = response.data;
          
          setUserData({
            _id: user._id,
            name: user.name || 'No Name',
            email: user.email || 'No Email',
            orderCount: user.orders?.length || 0,
            wishlistCount: wishlist?.length || 0,
            createdAt: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'
          });
          setTempName(user.name || '');
        } else {
          throw new Error(response.data?.message || 'Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching user data:', error.message);
        
        if (error.response?.status === 401) {
          toast.error('Session expired. Please log in again.');
          localStorage.removeItem('token');
          navigate('/login');
        } else {
          toast.error(`Failed to load profile data: ${error.response?.data?.message || error.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [token, navigate, backendUrl, wishlist]);

  const handleNameChange = (e) => {
    setTempName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tempName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      const response = await axios.put(
        `${backendUrl}/api/user/update-name`,
        { name: tempName },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          } 
        }
      );

      setUserData(prev => ({
        ...prev,
        name: tempName
      }));
      
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const startEditing = () => {
    if (userData) {
      setTempName(userData.name);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setTempName(userData.name);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Failed to load profile data</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account details and preferences</p>
        </div>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="px-6 py-8 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="ml-6">
                  <h2 className="text-2xl font-bold">{userData.name}</h2>
                  <p className="text-gray-300">{userData.email}</p>
                </div>
              </div>
              <div className="mt-4 md:mt-0">
                <span className="inline-block bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium">
                  Member since {userData.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <div className="flex flex-wrap -mx-2">
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4 lg:mb-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                        <FiShoppingBag className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Orders</p>
                        <p className="text-2xl font-semibold text-gray-900">{userData.orderCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3 px-2 mb-4 lg:mb-0">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                        <FiHeart className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">Wishlist</p>
                        <p className="text-2xl font-semibold text-gray-900">{userData.wishlistCount}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 lg:w-1/3 px-2">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="p-3 rounded-full bg-green-100 text-green-600">
                        <FiUser className="w-6 h-6" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-500">User ID</p>
                        <p className="text-sm font-mono text-gray-900 truncate">{userData._id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="px-6 py-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
              {!isEditing ? (
                <button
                  onClick={startEditing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FiEdit2 className="mr-2 h-4 w-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiX className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <FiSave className="mr-2 h-4 w-4" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="mt-1">
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        id="name"
                        value={tempName}
                        onChange={handleNameChange}
                        className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                        required
                      />
                    ) : (
                      <p className="mt-1 text-sm text-gray-900">{userData.name}</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email address
                  </label>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">{userData.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
