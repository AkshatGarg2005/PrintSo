// src/components/CloudinaryTest.js
import React, { useState } from 'react';
import { Card, Button, Form, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import cloudinaryConfig from '../cloudinary';

const CloudinaryTest = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const testUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', cloudinaryConfig.uploadPreset);

      console.log('Cloudinary config:', {
        cloudName: cloudinaryConfig.cloudName,
        uploadPreset: cloudinaryConfig.uploadPreset
      });
      
      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/upload`,
        formData
      );
      
      console.log('Upload successful:', response.data);
      setResult(response.data);
    } catch (err) {
      console.error('Upload failed:', err);
      
      if (err.response) {
        console.error('Response data:', err.response.data);
        setError(`Upload failed: ${JSON.stringify(err.response.data)}`);
      } else {
        setError(`Upload failed: ${err.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Cloudinary Connection Test</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Select a file to test upload</Form.Label>
          <Form.Control 
            type="file" 
            onChange={handleFileChange}
            disabled={uploading}
          />
        </Form.Group>
        
        <Button 
          onClick={testUpload} 
          disabled={!file || uploading}
          className="mb-3"
        >
          {uploading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Uploading...
            </>
          ) : 'Test Upload'}
        </Button>
        
        {error && (
          <Alert variant="danger" className="mt-3">
            <strong>Error:</strong> {error}
          </Alert>
        )}
        
        {result && (
          <div className="mt-3">
            <Alert variant="success">
              <strong>Upload Successful!</strong>
            </Alert>
            <div className="mt-2">
              <strong>URL:</strong> <a href={result.secure_url} target="_blank" rel="noopener noreferrer">{result.secure_url}</a>
            </div>
            <div className="mt-2">
              <strong>Public ID:</strong> {result.public_id}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CloudinaryTest;