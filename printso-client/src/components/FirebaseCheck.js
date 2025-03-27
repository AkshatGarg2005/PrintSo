// src/components/FirebaseCheck.js
import React, { useEffect, useState } from 'react';
import { Card, Alert } from 'react-bootstrap';
import { db } from '../firebase';
import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

const FirebaseCheck = () => {
  const [status, setStatus] = useState('checking');
  const [error, setError] = useState(null);
  const [testDocId, setTestDocId] = useState(null);

  useEffect(() => {
    runFirebaseCheck();
  }, []);

  const runFirebaseCheck = async () => {
    try {
      setStatus('checking');
      setError(null);
      
      console.log("Starting Firebase connection test...");
      
      // Step 1: Try to read from the orders collection
      console.log("Testing read access...");
      const querySnapshot = await getDocs(collection(db, 'orders'));
      console.log(`Successfully read ${querySnapshot.docs.length} documents from orders collection`);
      
      // Step 2: Try to create a test document
      console.log("Testing write access...");
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: "This is a test document to verify Firebase permissions"
      };
      
      const docRef = await addDoc(collection(db, 'orders'), testData);
      setTestDocId(docRef.id);
      console.log("Successfully created test document with ID:", docRef.id);
      
      // Step 3: Clean up by deleting the test document
      console.log("Cleaning up test document...");
      await deleteDoc(doc(db, 'orders', docRef.id));
      console.log("Successfully deleted test document");
      
      setStatus('success');
    } catch (err) {
      console.error("Firebase connection test failed:", err);
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Firebase Connection Test</h5>
      </Card.Header>
      <Card.Body>
        {status === 'checking' && (
          <Alert variant="info">
            Testing Firebase connection...
          </Alert>
        )}
        
        {status === 'success' && (
          <Alert variant="success">
            <strong>Success!</strong> Firebase connection and permissions are working correctly.
          </Alert>
        )}
        
        {status === 'error' && (
          <Alert variant="danger">
            <strong>Error!</strong> Firebase connection test failed.<br/>
            Error message: {error}
          </Alert>
        )}
        
        <div className="mt-3">
          <button 
            className="btn btn-primary" 
            onClick={runFirebaseCheck}
            disabled={status === 'checking'}
          >
            {status === 'checking' ? 'Testing...' : 'Run Test Again'}
          </button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default FirebaseCheck;