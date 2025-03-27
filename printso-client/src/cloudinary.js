// src/cloudinary.js
// Cloudinary configuration from environment variables
const cloudinaryConfig = {
    cloudName: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    uploadPreset: process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  };
  
  export default cloudinaryConfig;