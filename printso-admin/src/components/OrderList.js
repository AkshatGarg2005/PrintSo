// src/components/OrderList.js
import React, { useState, useEffect } from 'react';
import { Table, Badge, Card, Spinner, Form, InputGroup, Alert } from 'react-bootstrap';
import { collection, query, where, orderBy, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const OrderList = ({ status, onSelectOrder }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    // Create a query based on the status
    let ordersQuery;
    
    try {
      console.log("Fetching orders with status:", status);
      
      if (status === 'all') {
        ordersQuery = query(
          collection(db, 'orders'),
          orderBy('timestamp', 'desc')
        );
      } else {
        ordersQuery = query(
          collection(db, 'orders'),
          where('status', '==', status),
          orderBy('timestamp', 'desc')
        );
      }

      // Listen for real-time updates
      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        console.log(`Received ${snapshot.docs.length} orders from Firestore`);
        
        const ordersList = snapshot.docs.map(doc => {
          const data = doc.data();
          console.log(`Order ${doc.id}:`, data);
          return {
            id: doc.id,
            ...data
          };
        });
        
        setOrders(ordersList);
        setFilteredOrders(ordersList);
        setLoading(false);
        setError(null);
      }, (err) => {
        console.error("Error fetching orders:", err);
        setError(`Error fetching orders: ${err.message}`);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up orders query:", err);
      setError(`Error setting up query: ${err.message}`);
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(order => 
        (order.name && order.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.email && order.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.contactNo && order.contactNo.includes(searchTerm))
      );
      setFilteredOrders(filtered);
    }
  }, [searchTerm, orders]);

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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending':
        return <Badge bg="warning">Pending</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2">Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Error Loading Orders</Alert.Heading>
        <p>{error}</p>
        <hr />
        <p className="mb-0">
          Please check your Firebase connection and security rules.
        </p>
      </Alert>
    );
  }

  return (
    <Card.Body>
      <div className="mb-3">
        <InputGroup>
          <InputGroup.Text>
            <i className="bi bi-search"></i>
          </InputGroup.Text>
          <Form.Control
            placeholder="Search by name, email or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-4">
          <p className="mb-0 text-muted">No orders found.</p>
          <p className="text-muted small mt-2">
            Status filter: <span className="fw-bold">{status}</span>
          </p>
        </div>
      ) : (
        <div className="table-responsive">
          <Table hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Contact</th>
                <th>Date</th>
                <th>Print Type</th>
                <th>Files</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map(order => (
                <tr 
                  key={order.id} 
                  className="order-item"
                  onClick={() => onSelectOrder(order)}
                >
                  <td>{order.id.slice(0, 8)}...</td>
                  <td>{order.name || 'N/A'}</td>
                  <td>{order.contactNo || 'N/A'}</td>
                  <td>{formatDate(order.timestamp)}</td>
                  <td>{order.printType === 'bw' ? 'B&W' : 'Color'}</td>
                  <td>{(order.pdfFiles?.length || 0)}</td>
                  <td>₹{order.price || 0}</td>
                  <td>{getStatusBadge(order.status || 'unknown')}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </Card.Body>
  );
};

export default OrderList;