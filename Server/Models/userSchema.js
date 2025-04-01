const mongoose = require('mongoose');
const Joi = require('joi');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  favoriteServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceProvider',
  }],
  clickHistory: [{
    serviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceProvider',
    },
    timestamp: {
      type: Date,
      default: Date.now,
    }
  }],
  pets: [{
    name: String,
    type: String,
    breed: String,
    age: Number,
  }],
  membership: {
    status: {
      type: String,
      enum: ['inactive', 'active', 'expired'],
      default: 'inactive'
    },
    type: {
      type: String,
      enum: ['free', 'premium'],
      default: 'free'
    },
    startDate: Date,
    endDate: Date
  },
  paymentHistory: [{
    orderId: String,
    amount: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentMethod: String,
    transactionId: String,
    message: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
userSchema.index({ email: 1 }, { unique: true });

const userRegisterSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const User = mongoose.model('User', userSchema);

module.exports = { User, userRegisterSchema, userLoginSchema };

// const bcrypt = require("bcrypt");
// userSchema.pre('save', async function (next) {
//     const user = this;
//     if (user.isModified('password')) {
//         user.password = await bcrypt.hash(user.password, 10);
//     }
//     next();
// })
