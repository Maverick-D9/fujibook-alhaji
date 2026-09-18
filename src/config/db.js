const mongoose = require('mongoose');
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/fujibook');
    console.log('MongoDB Connected');
  } catch (err) {
    console.log('Mongo not running, using memory for now');
  }
};
module.exports = connectDB;