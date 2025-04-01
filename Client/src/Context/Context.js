import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { axios } from '../Utils/Axios';
import toast from 'react-hot-toast';

const PetContext = createContext();

const PetProvider = ({ children }) => {
  const [userID, setUserID] = useState(localStorage.getItem('userID') || null);
  const [services, setServices] = useState([]);
  const [loginStatus, setLoginStatus] = useState(userID ? true : false);
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [membership, setMembership] = useState(null);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  // Set up axios with authentication
  useEffect(() => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    console.log("Token from localStorage:", token);
    
    // Configure axios defaults
    axios.defaults.baseURL = 'http://localhost:5000';
    axios.defaults.withCredentials = true;
    
    // Set default headers for all requests
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("Set default Authorization header:", `Bearer ${token}`);
    }
    
    // Add a request interceptor to include the token in all requests
    const interceptor = axios.interceptors.request.use(
      (config) => {
        // Get the latest token (in case it was updated)
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        
        // Remove withCredentials from headers (it should be a config option, not a header)
        if (config.headers.withcredentials) {
          delete config.headers.withcredentials;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
    
    // Add a response interceptor to handle unauthorized errors
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.log("Unauthorized response detected");
          toast.error('Your session has expired. Please login again.');
          
          // Clear user data and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('userID');
          setLoginStatus(false);
          setUserID(null);
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );
    
    // Clean up interceptors on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  // Get user's location on initial load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          toast.error("Unable to get your location. Some features may be limited.");
        }
      );
    }
  }, []);

  // Fetch all services
  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        console.log("Fetching services...");
        // Use the correct endpoint
        const response = await axios.get('/service');
        console.log("Services response:", response.data);
        
        if (response.data && response.data.status === 'success') {
          setServices(response.data.data);
          console.log("Services set to:", response.data.data);
        } else {
          console.error('Failed to fetch services:', response.data?.message);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        // Try alternative endpoint if the first one fails
        try {
          console.log("Trying alternative endpoint...");
          const response = await axios.get('/api/services');
          console.log("Alternative services response:", response.data);
          
          if (response.data && response.data.status === 'success') {
            setServices(response.data.data);
            console.log("Services set to:", response.data.data);
          } else {
            console.error('Failed to fetch services from alternative endpoint:', response.data?.message);
          }
        } catch (altError) {
          console.error('Error fetching services from alternative endpoint:', altError);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch user's favorites if logged in
  useEffect(() => {
    if (userID) {
      fetchFavorites();
    }
  }, [userID]);

  const fetchFavorites = async () => {
    if (!loginStatus || !userID) {
      console.log("Cannot fetch favorites: User not logged in or missing ID");
      return;
    }
    
    try {
      // Use the correct endpoint
      console.log("Making API request to:", `/user/${userID}/favorites`);
      console.log("Authorization header:", axios.defaults.headers.common['Authorization']);
      
      const response = await axios.get(`/user/${userID}/favorites`);
      console.log("Favorites API response:", response.data);
      
      if (response.data && response.data.status === 'success') {
        setFavorites(response.data.data);
        console.log("Favorites set to:", response.data.data);
      } else {
        console.log("Failed to fetch favorites:", response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      
      if (error.response?.status === 401) {
        console.log("Authentication error");
        // Don't automatically log out, just show a message
        toast.error('Session expired. Please login again.');
      }
    }
  };

  const fetchServicesByCategory = async (category) => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/users/services/category/${category}`);
      setLoading(false);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching services");
      setLoading(false);
      return [];
    }
  };

  const fetchServiceDetails = async (id) => {
    try {
      const response = await axios.get(`/api/users/services/${id}`);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching service details");
      return null;
    }
  };

  const fetchUserMembership = async () => {
    console.log("Fetching membership status...");
    console.log("Login status:", loginStatus);
    console.log("User ID:", userID);
    
    if (!loginStatus || !userID) {
      console.log("Cannot fetch membership: User not logged in or missing ID");
      return;
    }
    
    try {
      console.log("Making API request to:", `/user/${userID}/membership`);
      console.log("Authorization header:", axios.defaults.headers.common['Authorization']);
      
      const response = await axios.get(`/user/${userID}/membership`);
      console.log("Membership API response:", response.data);
      
      if (response.data && response.data.status === 'success') {
        setMembership(response.data.data.membership);
        console.log("Membership set to:", response.data.data.membership);
      } else {
        console.log("Failed to fetch membership:", response.data?.message);
      }
    } catch (error) {
      console.error('Error fetching membership:', error);
      
      if (error.response?.status === 401) {
        console.log("Authentication error");
        toast.error('Session expired. Please login again.');
        
        // Optional: Log out the user if authentication fails
        // localStorage.removeItem('token');
        // localStorage.removeItem('userID');
        // setLoginStatus(false);
        // setUserID(null);
        // axios.defaults.headers.common['Authorization'] = '';
      }
    }
  };

  useEffect(() => {
    if (loginStatus && userID) {
      fetchUserMembership();
    } else {
      setMembership(null);
    }
  }, [loginStatus, userID]);

  const searchServices = async (query, category, location) => {
    setLoading(true);
    try {
      // Check if user has active membership
      if (!loginStatus || (membership && membership.status !== 'active')) {
        toast.error('Premium membership required to search services');
        navigate('/membership');
        return [];
      }
      
      // Continue with existing search logic
      const response = await axios.get(`/user/services/search?query=${query || ''}&category=${category || ''}&location=${location || ''}`);
      
      if (response.data.status === 'success') {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error('Search error:', error);
      toast.error('Error searching services');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getNearbyServices = async (radius = 10) => {
    if (!userLocation) {
      toast.error("Location not available. Please enable location services.");
      return [];
    }

    try {
      setLoading(true);
      const { latitude, longitude } = userLocation;
      const response = await axios.get(
        `/api/users/services/nearby?latitude=${latitude}&longitude=${longitude}&radius=${radius}`
      );
      setLoading(false);
      return response.data.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching nearby services");
      setLoading(false);
      return [];
    }
  };

  const addToFavorites = async (serviceId) => {
    if (!userID) {
      toast.error("Please login to add to favorites");
      navigate('/login');
      return;
    }

    try {
      // Get a fresh token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Your session has expired. Please login again.");
        logoutUser();
        navigate('/login');
        return;
      }
      
      console.log("Adding to favorites:", serviceId);
      console.log("User ID:", userID);
      console.log("Token being used:", token);
      
      // Try a different endpoint format that matches your server
      const response = await axios.post(`/api/users/${userID}/favorites`, 
        { serviceId },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      console.log("Add to favorites response:", response.data);
      toast.success("Added to favorites");
      fetchFavorites();
      return true;
    } catch (error) {
      console.error("Error adding to favorites:", error);
      
      // Try alternative endpoint if first one fails
      try {
        console.log("Trying alternative endpoint format...");
        const token = localStorage.getItem('token');
        
        const response = await axios.post(`/user/favorites/add`, 
          { serviceId, userId: userID },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Add to favorites response (alternative):", response.data);
        toast.success("Added to favorites");
        fetchFavorites();
        return true;
      } catch (altError) {
        console.error("Error with alternative endpoint:", altError);
        
        if (error.response?.status === 401 || altError.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");
          logoutUser();
          navigate('/login');
        } else {
          toast.error("Error adding to favorites. Please try again.");
        }
        return false;
      }
    }
  };

  const removeFromFavorites = async (serviceId) => {
    if (!userID) {
      toast.error("Please login to manage favorites");
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error("Your session has expired. Please login again.");
        logoutUser();
        navigate('/login');
        return;
      }
      
      console.log("Removing from favorites:", serviceId);
      
      // Try a different endpoint format that matches your server
      const response = await axios.delete(`/api/users/${userID}/favorites/${serviceId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log("Remove from favorites response:", response.data);
      toast.success("Removed from favorites");
      fetchFavorites();
      return true;
    } catch (error) {
      console.error("Error removing from favorites:", error);
      
      // Try alternative endpoint if first one fails
      try {
        console.log("Trying alternative endpoint format for removal...");
        const token = localStorage.getItem('token');
        
        const response = await axios.post(`/user/favorites/remove`, 
          { serviceId, userId: userID },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Remove from favorites response (alternative):", response.data);
        toast.success("Removed from favorites");
        fetchFavorites();
        return true;
      } catch (altError) {
        console.error("Error with alternative removal endpoint:", altError);
        
        if (error.response?.status === 401 || altError.response?.status === 401) {
          toast.error("Your session has expired. Please login again.");
          logoutUser();
          navigate('/login');
        } else {
          toast.error("Error removing from favorites. Please try again.");
        }
        return false;
      }
    }
  };

  const trackAffiliateClick = async (serviceId) => {
    try {
      console.log("\n=== Track Affiliate Click Start ===");
      console.log("Service ID:", serviceId);
      console.log("User ID:", userID);
      
      // First try to get the service details
      const serviceDetails = await fetchServiceDetails(serviceId);
      if (serviceDetails?.affiliateLink) {
        window.open(serviceDetails.affiliateLink, '_blank');
        
        // Track in background if logged in
        if (loginStatus && userID) {
          try {
            await axios.post(`/user/${userID}/track/${serviceId}`);
          } catch (trackError) {
            console.error("Track request failed:", trackError.response?.data);
          }
        }
        return;
      }
      
      toast.error("Could not find affiliate link");
    } catch (error) {
      console.error("Error in trackAffiliateClick:", error);
      toast.error("Error opening affiliate link");
    }
  };

  const addReview = async (serviceId, rating, comment) => {
    if (!userID) {
      toast.error("Please login to leave a review");
      navigate('/login');
      return;
    }

    try {
      await axios.post(`/api/users/services/${serviceId}/review`, { rating, comment });
      toast.success("Review added successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Error adding review");
      return false;
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/user/login', { email, password });
      
      if (response.data.status === 'success') {
        // Store token and user ID in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userID', response.data.data._id);
        localStorage.setItem('name', response.data.data.name || '');
        
        // Update axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        
        // Update state
        setLoginStatus(true);
        setUserID(response.data.data._id);
        setUserName(response.data.data.name);
        setMembership(response.data.data.membership);
        
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logoutUser = () => {
    console.log('Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('userID');
    localStorage.removeItem('name');
    
    // Clear the Authorization header
    axios.defaults.headers.common['Authorization'] = '';
    
    setLoginStatus(false);
    setUserID(null);
    setMembership({
      status: 'inactive',
      type: 'free',
      startDate: null,
      endDate: null
    });
    console.log('User logged out successfully');
    return true;
  };

  // Add this useEffect to check and refresh the authentication token on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserID = localStorage.getItem('userID');
    
    if (token && storedUserID) {
      // Set the token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log("Setting Authorization header from localStorage:", `Bearer ${token}`);
      
      // Update state
      setLoginStatus(true);
      setUserID(storedUserID);
    } else {
      // Clear any potentially invalid state
      setLoginStatus(false);
      setUserID(null);
    }
  }, []);

  return (
    <PetContext.Provider
      value={{
        services,
        fetchServicesByCategory,
        fetchServiceDetails,
        searchServices,
        getNearbyServices,
        favorites,
        addToFavorites,
        removeFromFavorites,
        trackAffiliateClick,
        addReview,
        loginStatus,
        setLoginStatus,
        loading,
        userLocation,
        membership,
        fetchUserMembership,
        login,
        userID,
        logoutUser,
        userName,
      }}
    >
      {children}
    </PetContext.Provider>
  );
};

export { PetContext, PetProvider };
