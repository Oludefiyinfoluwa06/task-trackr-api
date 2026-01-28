const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/task-trackr';
  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
    mongoose.connection.on('error', (err) => console.error('MongoDB connection error:', err));
  } catch (err) {
    console.error('MongoDB connection failed:', err);
    throw err;
  }
};

const closeDB = async () => {
  try {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  } catch (err) {
    console.error('Error disconnecting MongoDB', err);
  }
};

process.on('SIGINT', async () => {
  await closeDB();
  process.exit(0);
});

module.exports = { connectDB, closeDB, mongoose };
