import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';  // Use the single firebase.js file
import CloudinaryWidget from './CloudinaryWidget';

const OrderForm = ({ onSubmit, isSubmitting, orderSubmitted }) => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileUploadSuccess = (fileInfo) => {
    // Check if we already have this file (by public_id)
    if (!uploadedFiles.some(file => file.public_id === fileInfo.public_id)) {
      setUploadedFiles(prev => [...prev, fileInfo]);
    }
    setUploadError('');
  };

  const handleFileUploadFailure = (error) => {
    console.error("File upload failed:", error);
    setUploadError('Error uploading file. Please try again.');
  };

  const removeFile = (index) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const onFormSubmit = async (data) => {
    try {
      setUploadError('');
      
      console.log("Starting form submission with files:", uploadedFiles);
      
      if (uploadedFiles.length === 0) {
        setUploadError('Please upload at least one PDF file');
        return;
      }
      
      // Calculate total pages (either from file info or default to 1 per file)
      const totalPages = uploadedFiles.reduce((sum, file) => sum + (file.pages || 1), 0);
      
      const orderData = {
        ...data,
        pdfFiles: uploadedFiles,
        totalPages,
        price: data.printType === 'bw' ? totalPages * 3 : totalPages * 8,
        specialFeatures: {
          stickFile: data.stickFile || false,
          spiralBinding: data.spiralBinding || false,
          glue: data.glue || false
        },
        submittedAt: new Date().toISOString(),
        status: 'pending', // Make sure status is explicitly set to 'pending'
        timestamp: new Date().toISOString() // Use ISO string for timestamp
      };
      
      console.log("Saving order to Firestore:", orderData);
      
      // Save to Firestore
      try {
        const docRef = await addDoc(collection(db, 'orders'), orderData);
        console.log("Order saved successfully with ID:", docRef.id);
        
        // Pass the order data up to parent component
        onSubmit({
          ...orderData,
          id: docRef.id
        });
      } catch (error) {
        console.error("Error saving to Firestore:", error);
        setUploadError(`Error saving order: ${error.message}. Please check your internet connection and try again.`);
      }

    } catch (error) {
      console.error("Error submitting form:", error);
      setUploadError('Error creating order. Please try again. ' + error.message);
    }
  };

  return (
    <Card className="p-4 mb-4">
      <Card.Body>
        <h2 className="mb-4">Submit Print Order</h2>
        
        {uploadError && <Alert variant="danger">{uploadError}</Alert>}
        
        <Form onSubmit={handleSubmit(onFormSubmit)}>
          <Form.Group className="mb-3">
            <Form.Label>Full Name</Form.Label>
            <Form.Control 
              type="text" 
              placeholder="Enter your full name"
              {...register("name", { required: "Name is required" })}
              isInvalid={!!errors.name}
              disabled={orderSubmitted}
            />
            {errors.name && <Form.Control.Feedback type="invalid">{errors.name.message}</Form.Control.Feedback>}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control 
              type="tel" 
              placeholder="Enter your contact number"
              {...register("contactNo", { required: "Contact number is required" })}
              isInvalid={!!errors.contactNo}
              disabled={orderSubmitted}
            />
            {errors.contactNo && <Form.Control.Feedback type="invalid">{errors.contactNo.message}</Form.Control.Feedback>}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Email Address</Form.Label>
            <Form.Control 
              type="email" 
              placeholder="Enter your email address"
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address"
                }
              })}
              isInvalid={!!errors.email}
              disabled={orderSubmitted}
            />
            {errors.email && <Form.Control.Feedback type="invalid">{errors.email.message}</Form.Control.Feedback>}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Print Type</Form.Label>
            <div>
              <Form.Check
                inline
                type="radio"
                label="Black & White (₹3/page)"
                value="bw"
                {...register("printType", { required: "Please select print type" })}
                id="bw-option"
                defaultChecked
                disabled={orderSubmitted}
              />
              <Form.Check
                inline
                type="radio"
                label="Color (₹8/page)"
                value="color"
                {...register("printType", { required: "Please select print type" })}
                id="color-option"
                disabled={orderSubmitted}
              />
            </div>
            {errors.printType && <div className="text-danger">{errors.printType.message}</div>}
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Special Features</Form.Label>
            <div className="d-flex flex-wrap">
              <Form.Check
                type="checkbox"
                label="Stick File"
                {...register("stickFile")}
                id="stick-file"
                className="feature-option"
                disabled={orderSubmitted}
              />
              <Form.Check
                type="checkbox"
                label="Spiral Binding"
                {...register("spiralBinding")}
                id="spiral-binding"
                className="feature-option"
                disabled={orderSubmitted}
              />
              <Form.Check
                type="checkbox"
                label="Glue"
                {...register("glue")}
                id="glue"
                className="feature-option"
                disabled={orderSubmitted}
              />
            </div>
          </Form.Group>
          
          <Form.Group className="mb-4">
            <Form.Label>Upload PDF Files (Maximum 5)</Form.Label>
            <div className="file-upload-container">
              <div className="text-center mb-3">
                <CloudinaryWidget 
                  onUploadSuccess={handleFileUploadSuccess}
                  onUploadFailure={handleFileUploadFailure}
                  disabled={orderSubmitted || uploadedFiles.length >= 5}
                />
                <p className="text-muted small">{uploadedFiles.length}/5 files uploaded</p>
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mb-3">
                  <h6>Uploaded Files:</h6>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <div>
                        <i className="bi bi-file-earmark-pdf me-2"></i>
                        {file.name}
                        <span className="text-muted ms-2">({file.pages || 1} pages)</span>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={orderSubmitted}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Form.Text className="text-muted">
              Upload up to 5 PDF files. We'll calculate the price based on total pages.
            </Form.Text>
          </Form.Group>
          
          <div className="text-center">
            <Button 
              variant="primary" 
              type="submit" 
              size="lg"
              disabled={isSubmitting || orderSubmitted || uploadedFiles.length === 0}
            >
              {isSubmitting ? 'Processing...' : orderSubmitted ? 'Order Processed' : 'Calculate Price'}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default OrderForm;