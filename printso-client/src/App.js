import React, { useState } from 'react';
import { Container, Row, Col, Card, Tabs, Tab } from 'react-bootstrap';
import OrderForm from './components/OrderForm';
import PriceSummary from './components/PriceSummary';
import FirebaseCheck from './components/FirebaseCheck';
import FirebaseConfigCheck from './components/FirebaseConfigCheck';
import SimpleFirebaseTest from './components/SimpleFirebaseTest';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [orderData, setOrderData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showTests, setShowTests] = useState(true); // Show test components

  const handleOrderSubmit = (data) => {
    setOrderData(data);
  };

  const handleFinalSubmit = () => {
    setIsSubmitting(true);
    // After submission is complete
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      // Reset after 5 seconds
      setTimeout(() => {
        setOrderData(null);
        setSubmitSuccess(false);
      }, 5000);
    }, 1500);
  };

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">PrintSo Print Shop</h1>
      
      {/* Diagnostic Components - Remove after testing */}
      {showTests && (
        <Row className="mb-4">
          <Col>
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="mb-0">Firebase Diagnostics</h5>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowTests(false)}>
                    Hide Diagnostics
                  </button>
                </div>
              </Card.Header>
              <Card.Body>
                <Tabs defaultActiveKey="simple" className="mb-3">
                  <Tab eventKey="simple" title="Simple Test">
                    <SimpleFirebaseTest />
                  </Tab>
                  <Tab eventKey="config" title="Config">
                    <FirebaseConfigCheck />
                  </Tab>
                  <Tab eventKey="advanced" title="Advanced Test">
                    <FirebaseCheck />
                  </Tab>
                </Tabs>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
      
      <Row>
        <Col md={8}>
          {submitSuccess ? (
            <Card className="p-4 mb-4">
              <Card.Body className="text-center">
                <h3 className="text-success">Order Submitted Successfully!</h3>
                <p>Thank you for your order. We'll contact you soon.</p>
              </Card.Body>
            </Card>
          ) : (
            <OrderForm 
              onSubmit={handleOrderSubmit} 
              isSubmitting={isSubmitting}
              orderSubmitted={!!orderData}
            />
          )}
        </Col>
        <Col md={4}>
          {orderData && !submitSuccess && (
            <PriceSummary 
              orderData={orderData} 
              onSubmit={handleFinalSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </Col>
      </Row>
    </Container>
  );
}

export default App;