require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const userRoutes = require('./Routes/userRoutes');
const adminRoutes = require('./Routes/adminRoutes');
const paymentRoutes = require('./Routes/paymentRoutes');
const serviceRoutes = require('./Routes/serviceRoutes');
const { authenticateToken } = require('./Middleware/authMiddleware');

// Configure CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'withcredentials']
}));

// Parse JSON request body
app.use(express.json());
app.use(cookieParser());

app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/user', userRoutes);
app.use('/payment', paymentRoutes);
app.use('/service', serviceRoutes);
app.use('/api/services', serviceRoutes);

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/petservices', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error: '));
db.once('open', () => console.log('Connected Successfully'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
