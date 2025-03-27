import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tab, Tabs, Button } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase';
import Login from './components/Login';
import OrderList from './components/OrderList';
import OrderDetails from './components/OrderDetails';
import FirebaseDiagnostics from './components/FirebaseDiagnostics';
import PdfTest from './components/PdfTest';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  const handleCloseDetails = () => {
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading admin panel...</p>
        </div>
      </Container>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="mb-0">PrintSo Admin Panel</h1>
          <p className="text-muted">Manage print shop orders</p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <Button 
            variant="outline-info"
            className="me-3"
            onClick={() => setShowDiagnostics(!showDiagnostics)}
          >
            {showDiagnostics ? 'Hide Diagnostics' : 'Show Diagnostics'}
          </Button>
          <div className="me-3">
            <strong>{user.email}</strong>
          </div>
          <button 
            className="btn btn-outline-secondary"
            onClick={() => auth.signOut()}
          >
            Sign Out
          </button>
        </Col>
      </Row>

      {showDiagnostics && (
        <Row className="mb-4">
          <Col>
            <FirebaseDiagnostics />
          </Col>
        </Row>
      )}

      <Row>
        {selectedOrder ? (
          <Col>
            <OrderDetails 
              order={selectedOrder} 
              onClose={handleCloseDetails}
            />
          </Col>
        ) : (
          <Col>
            <Card>
              <Card.Header>
                <Tabs
                  activeKey={activeTab}
                  onSelect={(k) => setActiveTab(k)}
                  className="mb-3"
                  fill
                >
                  <Tab eventKey="pending" title="Pending Orders">
                    <OrderList 
                      status="pending" 
                      onSelectOrder={handleSelectOrder} 
                    />
                  </Tab>
                  <Tab eventKey="completed" title="Completed Orders">
                    <OrderList 
                      status="completed" 
                      onSelectOrder={handleSelectOrder} 
                    />
                  </Tab>
                  <Tab eventKey="all" title="All Orders">
                    <OrderList 
                      status="all" 
                      onSelectOrder={handleSelectOrder} 
                    />
                  </Tab>
                </Tabs>
              </Card.Header>
            </Card>
          </Col>
        )}
      </Row>
    </Container>
  );
}

export default App;