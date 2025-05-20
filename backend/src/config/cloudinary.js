const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Configure Cloudinary
// The configuration can use either CLOUDINARY_URL environment variable
// or separate cloud_name, api_key, and api_secret variables
if (process.env.CLOUDINARY_URL) {
  // This will automatically configure from the CLOUDINARY_URL env var
  cloudinary.config();
} else {
  // Configure from separate environment variables
  cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
  });
}

module.exports = cloudinary;
