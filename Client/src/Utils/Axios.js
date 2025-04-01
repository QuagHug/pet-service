import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a custom axios instance
const instance = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
  timeout: 10000
});

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    
    // If token exists, add it to headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Setting Authorization header for request:", config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 401) {
        console.log("Token expired or invalid");
        
        // Don't automatically log out here, let the component handle it
      }
    } else if (error.request) {
      // The request was made but no response was received
      toast.error('Network error. Please check your connection.');
    } else {
      // Something happened in setting up the request that triggered an Error
      toast.error('An error occurred. Please try again.');
    }
    
    return Promise.reject(error);
  }
);

export { instance as axios };
