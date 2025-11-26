const mongoose = require('mongoose');

const mongoURI = 'mongodb://localhost:27017/Courrier_Management';

const connectDB = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
