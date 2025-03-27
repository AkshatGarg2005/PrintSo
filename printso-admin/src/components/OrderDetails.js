// src/components/OrderDetails.js
import React, { useState } from 'react';
import { Card, Row, Col, Button, ListGroup, Form, Alert, Spinner } from 'react-bootstrap';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import PdfViewer from './PdfViewer';

const OrderDetails = ({ order, onClose }) => {
  const [currentStatus, setCurrentStatus] = useState(order.status || 'pending');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      // Handle different timestamp formats
      let date;
      if (timestamp.toDate) {
        // Firestore Timestamp
        date = timestamp.toDate();
      } else if (timestamp.seconds) {
        // Firestore Timestamp in serialized form
        date = new Date(timestamp.seconds * 1000);
      } else {
        // ISO string or other format
        date = new Date(timestamp);
      }
      
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return String(timestamp).substring(0, 10);
    }
  };

  const handleStatusChange = async () => {
    setIsUpdating(true);
    setUpdateSuccess(false);
    setUpdateError('');
    
    try {
      await updateDoc(doc(db, 'orders', order.id), {
        status: currentStatus
      });
      
      setUpdateSuccess(true);
    } catch (error) {
      console.error("Error updating order status:", error);
      setUpdateError('Failed to update order status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleDeleteFile = async (file) => {
    if (!window.confirm(`Are you sure you want to delete "${file.name}"? This cannot be undone.`)) {
      return;
    }
    
    setIsDeletingFile(true);
    
    try {
      // Note: We can't actually delete the file from Cloudinary using client-side code
      // because it would require API Secret which would be insecure to include in frontend
      // In a production app, this should be done through a secure backend
      
      // For now, we'll just remove the reference from Firestore
      const fileIdentifier = file.public_id;
      const updatedFiles = order.pdfFiles.filter(f => f.public_id !== fileIdentifier);
      
      await updateDoc(doc(db, 'orders', order.id), {
        pdfFiles: updatedFiles
      });
      
      // Update local order state
      order.pdfFiles = updatedFiles;
      
      // Clear selected file if it was the one deleted
      if (selectedFile && selectedFile.public_id === fileIdentifier) {
        setSelectedFile(null);
      }
      
      alert('File removed from order successfully');
      
    } catch (error) {
      console.error("Error removing file:", error);
      alert('Failed to remove file. Please try again.');
    } finally {
      setIsDeletingFile(false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Order Details</h4>
        <Button variant="outline-secondary" onClick={onClose}>
          Back to List
        </Button>
      </Card.Header>
      <Card.Body>
        <Row>
          <Col md={6}>
            <h5 className="mb-3">Customer Information</h5>
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item>
                <strong>Name:</strong> {order.name}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Email:</strong> {order.email}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Contact:</strong> {order.contactNo}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Order Date:</strong> {formatDate(order.timestamp)}
              </ListGroup.Item>
            </ListGroup>
            
            <h5 className="mb-3">Order Information</h5>
            <ListGroup variant="flush" className="mb-4">
              <ListGroup.Item>
                <strong>Order ID:</strong> {order.id}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Print Type:</strong> {order.printType === 'bw' ? 'Black & White' : 'Color'}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Total Pages:</strong> {order.totalPages}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Price:</strong> ₹{order.price}
              </ListGroup.Item>
              <ListGroup.Item>
                <strong>Special Features:</strong>{' '}
                {Object.entries(order.specialFeatures || {})
                  .filter(([_, value]) => value)
                  .map(([key]) => key)
                  .join(', ') || 'None'}
              </ListGroup.Item>
            </ListGroup>
            
            <h5 className="mb-3">Order Status</h5>
            <div className="d-flex align-items-center mb-4">
              <Form.Select 
                value={currentStatus}
                onChange={(e) => setCurrentStatus(e.target.value)}
                className="me-2"
                style={{ width: '200px' }}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </Form.Select>
              <Button 
                variant="primary"
                onClick={handleStatusChange}
                disabled={isUpdating || currentStatus === order.status}
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </Button>
            </div>
            
            {updateSuccess && (
              <Alert variant="success">
                Order status updated successfully!
              </Alert>
            )}
            
            {updateError && (
              <Alert variant="danger">
                {updateError}
              </Alert>
            )}
          </Col>
          
          <Col md={6}>
            <h5 className="mb-3">PDF Files</h5>
            
            {order.pdfFiles && order.pdfFiles.length > 0 ? (
              <>
                <Row className="mb-4">
                  {order.pdfFiles.map((file, index) => (
                    <Col md={6} key={index} className="mb-3">
                      <div className="file-container position-relative">
                        <Card 
                          className={`h-100 ${selectedFile?.public_id === file.public_id ? 'border-primary' : ''}`}
                          onClick={() => handleFileSelect(file)}
                        >
                          <Card.Body className="p-2 text-center">
                            <div className="pdf-thumbnail bg-light d-flex align-items-center justify-content-center mb-2">
                              <i className="bi bi-file-earmark-pdf" style={{ fontSize: '3rem', color: '#dc3545' }}></i>
                            </div>
                            <div className="text-truncate">
                              {file.name}
                            </div>
                            <small className="text-muted">
                              {file.pages || 1} page(s)
                            </small>
                          </Card.Body>
                        </Card>
                        <div className="file-actions">
                          <Button 
                            variant="danger" 
                            size="sm"
                            className="me-1"
                            disabled={isDeletingFile}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFile(file);
                            }}
                            title="Delete file"
                          >
                            <i className="bi bi-trash"></i>
                          </Button>
                          <Button 
                            variant="success" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(file.url, '_blank');
                            }}
                            title="Download file"
                          >
                            <i className="bi bi-download"></i>
                          </Button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
                
                {selectedFile && (
                  <div className="mt-4">
                    <PdfViewer 
                      url={selectedFile.url}
                      filename={selectedFile.name}
                    />
                  </div>
                )}
              </>
            ) : (
              <Alert variant="info">
                No PDF files attached to this order.
              </Alert>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default OrderDetails;