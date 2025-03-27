// src/components/PriceSummary.js
import React from 'react';
import { Card, Button, ListGroup } from 'react-bootstrap';

const PriceSummary = ({ orderData, onSubmit, isSubmitting }) => {
  const specialFeatures = [];
  if (orderData.stickFile) specialFeatures.push('Stick File');
  if (orderData.spiralBinding) specialFeatures.push('Spiral Binding');
  if (orderData.glue) specialFeatures.push('Glue');

  // We would typically calculate additional costs for special features here
  // For simplicity, we're just showing them without extra cost
  
  return (
    <Card className="price-card">
      <Card.Header as="h5">Order Summary</Card.Header>
      <Card.Body>
        <ListGroup variant="flush" className="mb-3">
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Print Type:</span>
            <span>{orderData.printType === 'bw' ? 'Black & White' : 'Color'}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Price per page:</span>
            <span>₹{orderData.printType === 'bw' ? '3' : '8'}</span>
          </ListGroup.Item>
          <ListGroup.Item className="d-flex justify-content-between">
            <span>Total Pages:</span>
            <span>{orderData.totalPages}</span>
          </ListGroup.Item>
          {specialFeatures.length > 0 && (
            <ListGroup.Item>
              <div>Special Features:</div>
              <ul className="mb-0 ps-3 mt-1">
                {specialFeatures.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </ListGroup.Item>
          )}
        </ListGroup>
        
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">Total Price:</h4>
          <h3 className="mb-0 text-primary">₹{orderData.price}</h3>
        </div>
        
        <Button 
          variant="success" 
          size="lg" 
          className="w-100"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Confirm Order'}
        </Button>
        
        <div className="text-center mt-2">
          <small className="text-muted">
            By confirming, you agree to our terms and conditions.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default PriceSummary;