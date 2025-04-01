const express = require('express');
const app = express();
const paymentRoutes = require('./Routes/paymentRoutes');
const userRoutes = require('./Routes/userRoutes');

// Routes
app.use('/api/user', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

// ... rest of the server code 