const mongoose = require('mongoose');
const Joi = require('joi');

const serviceProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Veterinary', 'Grooming', 'Training', 'Boarding', 'Walking', 'Daycare', 'Pet Supplies'],
  },
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      type: {
        latitude: Number,
        longitude: Number,
      }
    }
  },
  contactInfo: {
    phone: String,
    email: String,
    website: String,
  },
  images: [String],
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: Number,
    comment: String,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
  affiliateLink: {
    type: String,
    required: true,
  },
  operatingHours: {
    monday: { open: String, close: String },
    tuesday: { open: String, close: String },
    wednesday: { open: String, close: String },
    thursday: { open: String, close: String },
    friday: { open: String, close: String },
    saturday: { open: String, close: String },
    sunday: { open: String, close: String },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index for geospatial queries
serviceProviderSchema.index({ 'location.coordinates': '2dsphere' });

const serviceProviderValidationSchema = Joi.object({
  id: Joi.string(),
  name: Joi.string().required(),
  description: Joi.string().required(),
  category: Joi.string().valid('Veterinary', 'Grooming', 'Training', 'Boarding', 'Walking', 'Daycare', 'Pet Supplies').required(),
  location: Joi.object({
    address: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    coordinates: Joi.object({
      latitude: Joi.number().required(),
      longitude: Joi.number().required(),
    }),
  }),
  contactInfo: Joi.object({
    phone: Joi.string().required(),
    email: Joi.string().email().required(),
    website: Joi.string().uri(),
  }),
  images: Joi.array().items(Joi.string()),
  affiliateLink: Joi.string().required(),
  operatingHours: Joi.object({
    monday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    tuesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    wednesday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    thursday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    friday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    saturday: Joi.object({ open: Joi.string(), close: Joi.string() }),
    sunday: Joi.object({ open: Joi.string(), close: Joi.string() }),
  }),
});

const ServiceProvider = mongoose.model('ServiceProvider', serviceProviderSchema);

module.exports = { ServiceProvider, serviceProviderValidationSchema }; 