// src/components/CloudinaryWidget.js
import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import cloudinaryConfig from '../cloudinary';

const CloudinaryWidget = ({ onUploadSuccess, onUploadFailure, disabled }) => {
  const [uploadWidget, setUploadWidget] = useState(null);
  
  useEffect(() => {
    // Load the Cloudinary script if it's not already loaded
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://upload-widget.cloudinary.com/global/all.js';
      script.async = true;
      script.onload = initializeWidget;
      document.body.appendChild(script);
    } else {
      initializeWidget();
    }
    
    return () => {
      // Cleanup function
      if (uploadWidget) {
        uploadWidget.close();
      }
    };
  }, []);
  
  const initializeWidget = () => {
    if (window.cloudinary) {
      const widget = window.cloudinary.createUploadWidget(
        {
          cloudName: cloudinaryConfig.cloudName,
          uploadPreset: cloudinaryConfig.uploadPreset,
          sources: ['local', 'url'],
          multiple: true,
          maxFiles: 5,
          maxFileSize: 10000000, // 10MB
          resourceType: 'auto',
          allowedFormats: ['pdf'],
          showUploadMoreButton: false,
          styles: {
            palette: {
              window: '#FFFFFF',
              windowBorder: '#90A0B3',
              tabIcon: '#0078FF',
              menuIcons: '#5A616A',
              textDark: '#000000',
              textLight: '#FFFFFF',
              link: '#0078FF',
              action: '#FF620C',
              inactiveTabIcon: '#0E2F5A',
              error: '#F44235',
              inProgress: '#0078FF',
              complete: '#20B832',
              sourceBg: '#F4F4F5'
            }
          }
        },
        (error, result) => {
          if (!error && result && result.event === 'success') {
            console.log('Upload success:', result.info);
            
            // Create a file object with the necessary details
            const fileInfo = {
              name: result.info.original_filename + '.pdf',
              url: result.info.secure_url,
              public_id: result.info.public_id,
              pages: 1 // Default to 1 page since we can't determine pages with the widget
            };
            
            onUploadSuccess(fileInfo);
          }
          
          if (error) {
            console.error('Upload error:', error);
            onUploadFailure(error);
          }
        }
      );
      
      setUploadWidget(widget);
    }
  };
  
  const openWidget = () => {
    if (uploadWidget) {
      uploadWidget.open();
    }
  };
  
  return (
    <Button 
      variant="primary" 
      onClick={openWidget} 
      disabled={disabled}
      className="mb-3"
    >
      Select PDF Files
    </Button>
  );
};

export default CloudinaryWidget;