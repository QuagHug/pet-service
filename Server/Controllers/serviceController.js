const { ServiceProvider, serviceProviderValidationSchema } = require('../Models/serviceProviderSchema');
const { User } = require('../Models/userSchema');
const mongoose = require('mongoose');

const serviceController = {
  getAllServices: async (req, res) => {
    try {
      console.log("getAllServices called");
      const services = await ServiceProvider.find();
      console.log(`Found ${services.length} services`);
      
      res.status(200).json({
        status: 'success',
        count: services.length,
        data: services
      });
    } catch (error) {
      console.error('Get all services error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error getting services',
        error: error.message
      });
    }
  },

  getServiceById: async (req, res) => {
    try {
      const serviceId = req.params.id;
      console.log("getServiceById called for ID:", serviceId);
      
      const service = await ServiceProvider.findById(serviceId);
      if (!service) {
        console.log("Service not found");
        return res.status(404).json({
          status: 'failure',
          message: 'Service not found'
        });
      }
      
      console.log("Service found");
      res.status(200).json({
        status: 'success',
        data: service
      });
    } catch (error) {
      console.error('Get service by ID error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error getting service',
        error: error.message
      });
    }
  },

  getServicesByCategory: async (req, res) => {
    const category = req.params.categoryname;
    const services = await ServiceProvider.find({ category });
    if (services.length === 0) {
      return res.json({ message: `No service providers found in ${category} category!` });
    }
    res.status(200).json({
      status: 'success',
      message: `Successfully fetched ${category} service providers.`,
      data: services,
    });
  },

  searchServices: async (req, res) => {
    try {
      const { query, category } = req.query;
      console.log("searchServices called with query:", query, "category:", category);
      
      let searchQuery = {};
      
      if (query) {
        searchQuery.$or = [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
      
      if (category) {
        searchQuery.category = category;
      }
      
      const services = await ServiceProvider.find(searchQuery);
      console.log(`Found ${services.length} services matching search criteria`);
      
      res.status(200).json({
        status: 'success',
        count: services.length,
        data: services
      });
    } catch (error) {
      console.error('Search services error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error searching services',
        error: error.message
      });
    }
  },

  getNearbyServices: async (req, res) => {
    try {
      const { latitude, longitude, maxDistance } = req.query;
      console.log("getNearbyServices called with coordinates:", latitude, longitude);
      
      if (!latitude || !longitude) {
        console.log("Missing coordinates");
        return res.status(400).json({
          status: 'failure',
          message: 'Latitude and longitude are required'
        });
      }
      
      // Convert to numbers
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const distance = maxDistance ? parseInt(maxDistance) : 10000; // Default 10km
      
      // Find services within the specified distance
      const services = await ServiceProvider.find({
        'location.coordinates': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: distance
          }
        }
      });
      
      console.log(`Found ${services.length} nearby services`);
      
      res.status(200).json({
        status: 'success',
        count: services.length,
        data: services
      });
    } catch (error) {
      console.error('Get nearby services error:', error);
      res.status(500).json({
        status: 'failure',
        message: 'Error getting nearby services',
        error: error.message
      });
    }
  },

  addToFavorites: async (req, res) => {
    const userId = req.params.id;
    const serviceId = req.body.serviceId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.favoriteServices.includes(serviceId)) {
      return res.status(400).json({ message: 'Service already in favorites' });
    }

    user.favoriteServices.push(serviceId);
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Added to favorites',
    });
  },

  removeFromFavorites: async (req, res) => {
    const userId = req.params.id;
    const serviceId = req.params.serviceId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteServices = user.favoriteServices.filter(
      (id) => id.toString() !== serviceId
    );
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Removed from favorites',
    });
  },

  getFavorites: async (req, res) => {
    const userId = req.params.id;
    
    const user = await User.findById(userId).populate('favoriteServices');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Successfully fetched favorites',
      data: user.favoriteServices,
    });
  },

  trackAffiliateClick: async (req, res) => {
    try {
      console.log("\n=== Track Affiliate Click ===");
      const userId = req.params.id;
      const serviceId = req.params.serviceId;
      
      console.log("Requested user ID:", userId);
      console.log("Service ID:", serviceId);
      console.log("Authenticated user:", req.user);
      console.log("Auth token present:", !!req.headers.authorization);
      
      // Check if the authenticated user is requesting their own data
      if (!req.user || req.user.id !== userId) {
        console.log("User ID mismatch or authentication issue");
        console.log("req.user:", req.user);
        console.log("userId:", userId);
        return res.status(403).json({
          status: 'failure',
          message: 'Unauthorized to track clicks for this user'
        });
      }

      // Record the click in user's history
      console.log("Recording click in user history");
      await User.findByIdAndUpdate(userId, {
        $push: {
          clickHistory: {
            serviceId,
            timestamp: new Date(),
          },
        },
      });

      // Get the affiliate link
      console.log("Fetching service details");
      const service = await ServiceProvider.findById(serviceId);
      if (!service) {
        console.log("Service not found");
        return res.status(404).json({ 
          status: 'failure',
          message: 'Service not found' 
        });
      }

      console.log("Affiliate link:", service.affiliateLink);
      console.log("=== Track Affiliate Click Success ===\n");
      
      res.status(200).json({
        status: 'success',
        message: 'Click tracked successfully',
        data: { affiliateLink: service.affiliateLink },
      });
    } catch (error) {
      console.error("Track affiliate click error:", error);
      res.status(500).json({
        status: 'failure',
        message: 'Error tracking affiliate click',
        error: error.message
      });
    }
  },

  addReview: async (req, res) => {
    const serviceId = req.params.id;
    const { rating, comment } = req.body;
    const userId = req.user.id; // Assuming user ID is available from auth middleware

    const service = await ServiceProvider.findById(serviceId);
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    // Add the review
    service.reviews.push({
      userId,
      rating,
      comment,
    });

    // Update the overall rating
    const totalRatings = service.reviews.reduce((sum, review) => sum + review.rating, 0);
    service.rating = totalRatings / service.reviews.length;

    await service.save();

    res.status(200).json({
      status: 'success',
      message: 'Review added successfully',
      data: service,
    });
  }
};

module.exports = serviceController; 