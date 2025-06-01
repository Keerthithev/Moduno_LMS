import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, Mail, Edit, Loader2 } from 'lucide-react';

const SettingsForm = ({ darkMode }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [user, setUser] = useState(null); // Initializing user state to null
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true); // Initially set loading to true
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // Fetch user data on component mount
  useEffect(() => {
    // Simulate fetching user data (Replace with actual API call if needed)
    const fetchUserData = async () => {
      try {
        // You can fetch from localStorage or an API here
        const storedUser = JSON.parse(localStorage.getItem('user')) || null;

        if (storedUser) {
          setUser(storedUser);
          setFormData({
            name: storedUser.name || '',
            email: storedUser.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          });
          setLoading(false); // Set loading to false once user data is fetched
        } else {
          toast.error('User data not found');
          setLoading(false); // Stop loading if no user data found
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast.error('Failed to load user data');
        setLoading(false); // Stop loading in case of an error
      }
    };

    fetchUserData();
  }, []); // Empty dependency array ensures this effect runs only once

  // If user data is not available or still loading, show loading message
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

 const handleProfileSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  // Log form data being sent
  console.log('Form Data Being Sent:', formData);

  try {
    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    
    if (avatarFile) {
      formDataToSend.append('avatar', avatarFile);
    }
    formDataToSend.append('name', formData.name);
    formDataToSend.append('email', formData.email);

    const res = await axios.put('http://localhost:1111/api/v1/profile', formDataToSend, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data'
      }
    });

    if (res.status === 200) {
      toast.success('Profile updated successfully');
      localStorage.setItem('user', JSON.stringify(res.data.data));
    } else {
      throw new Error('Failed to update profile');
    }
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error(error.response?.data?.message || 'Failed to update profile');
  } finally {
    setLoading(false);
  }
};


  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put('http://localhost:1111/api/v1/profile/password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Password updated successfully');
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`rounded-xl shadow-sm overflow-hidden ${
      darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
    } border`}>
      <div className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <nav className="flex -mb-px">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'profile'
                ? darkMode
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : darkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Profile Information
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
              activeTab === 'password'
                ? darkMode
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-500 text-blue-600'
                : darkMode
                ? 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Change Password
          </button>
        </nav>
      </div>

      <div className="p-6">
        {/* Profile Information Tab */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit}>
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-white shadow-md">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-4xl font-bold text-white">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100"
                  >
                    <Edit className="w-5 h-5 text-gray-700" />
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
                  Click on the icon to change your profile picture
                </p>
              </div>

              <div>
                <label htmlFor="name" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Change Password Tab */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="newPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                    minLength="6"
                  />
                </div>
                <p className={`mt-1 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Password must be at least 6 characters
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm New Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm rounded-md ${
                      darkMode
                        ? 'bg-gray-700 border-gray-600 text-white'
                        : 'border-gray-300 text-gray-900'
                    }`}
                    required
                    minLength="6"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Updating...
                    </>
                  ) : (
                    'Update Password'
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SettingsForm;
