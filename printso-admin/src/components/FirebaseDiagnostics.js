// src/components/FirebaseDiagnostics.js
import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { collection, getDocs, addDoc, query, limit } from 'firebase/firestore';
import { db } from '../firebase';

const FirebaseDiagnostics = () => {
  const [diagnosticResults, setDiagnosticResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (message, success = true) => {
    setDiagnosticResults(prev => [...prev, { 
      message, 
      success, 
      timestamp: new Date().toISOString() 
    }]);
  };

  const clearResults = () => {
    setDiagnosticResults([]);
  };

  const runDiagnostics = async () => {
    setIsRunning(true);
    clearResults();
    addResult("Starting Firebase diagnostics...");

    // Step 1: Check Firebase connection
    try {
      addResult("Checking Firebase connection...");
      const testCollection = collection(db, 'test_connection');
      const testDoc = await addDoc(testCollection, {
        message: "Diagnostics test",
        timestamp: new Date().toISOString()
      });
      addResult(`Successfully wrote to test_connection collection with ID: ${testDoc.id}`);
    } catch (error) {
      addResult(`Failed to write to test collection: ${error.message}`, false);
    }

    // Step 2: Check access to orders collection
    try {
      addResult("Checking access to orders collection...");
      const ordersQuery = query(collection(db, 'orders'), limit(10));
      const snapshot = await getDocs(ordersQuery);
      addResult(`Successfully read ${snapshot.docs.length} documents from orders collection`);
      
      // If there are orders, show details of the first one
      if (snapshot.docs.length > 0) {
        const firstOrder = snapshot.docs[0].data();
        const orderId = snapshot.docs[0].id;
        addResult(`First order details (ID: ${orderId}):`);
        addResult(`- Status: ${firstOrder.status || 'not set'}`);
        addResult(`- Timestamp type: ${typeof firstOrder.timestamp}`);
        
        if (firstOrder.timestamp) {
          if (firstOrder.timestamp.toDate) {
            addResult("- Timestamp is a Firestore timestamp object");
          } else if (typeof firstOrder.timestamp === 'string') {
            addResult("- Timestamp is stored as a string");
          }
        } else {
          addResult("- No timestamp field found", false);
        }
      } else {
        addResult("No orders found in the collection", false);
      }
    } catch (error) {
      addResult(`Failed to access orders collection: ${error.message}`, false);
    }

    // Step 3: Verify Firebase configuration
    try {
      addResult("Checking Firebase configuration...");
      const config = window.firebase ? window.firebase.app().options : null;
      if (config) {
        addResult(`Project ID: ${config.projectId}`);
      } else {
        addResult("Firebase configuration not accessible from window object", false);
      }
    } catch (error) {
      addResult(`Failed to check Firebase configuration: ${error.message}`, false);
    }

    setIsRunning(false);
    addResult("Diagnostics completed.");
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Firebase Connection Diagnostics</h5>
      </Card.Header>
      <Card.Body>
        <Button 
          variant="primary" 
          onClick={runDiagnostics}
          disabled={isRunning}
          className="mb-3"
        >
          {isRunning ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-2"
              />
              Running Diagnostics...
            </>
          ) : 'Run Diagnostics'}
        </Button>
        
        {diagnosticResults.length > 0 && (
          <div className="mt-3">
            <h6>Diagnostic Results:</h6>
            <div className="border rounded p-3 bg-light" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {diagnosticResults.map((result, index) => (
                <Alert 
                  key={index} 
                  variant={result.success ? 'info' : 'danger'} 
                  className="py-1 mb-2"
                >
                  {result.message}
                </Alert>
              ))}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default FirebaseDiagnostics;