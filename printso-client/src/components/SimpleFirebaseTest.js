import React, { useState } from 'react';
import { Card, Button, Alert } from 'react-bootstrap';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../firebase';  // Use the single firebase.js file

const SimpleFirebaseTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const clearResults = () => {
    setResults([]);
  };

  const addResult = (message, success = true) => {
    setResults(prev => [...prev, { message, success, timestamp: new Date().toISOString() }]);
  };

  const testRead = async () => {
    try {
      addResult("Attempting to read from Firestore...");
      const querySnapshot = await getDocs(collection(db, 'test'));
      addResult(`Successfully read ${querySnapshot.docs.length} documents from 'test' collection`);
      return true;
    } catch (error) {
      addResult(`Error reading from Firestore: ${error.message}`, false);
      console.error("Read error:", error);
      return false;
    }
  };

  const testWrite = async () => {
    try {
      addResult("Attempting to write to Firestore...");
      const docRef = await addDoc(collection(db, 'test'), {
        message: "Test document",
        timestamp: new Date().toISOString()
      });
      addResult(`Successfully wrote document with ID: ${docRef.id}`);
      return true;
    } catch (error) {
      addResult(`Error writing to Firestore: ${error.message}`, false);
      console.error("Write error:", error);
      return false;
    }
  };

  const runTests = async () => {
    setLoading(true);
    clearResults();
    
    addResult("Starting Firebase tests...");
    
    // Test Firestore read
    const readSuccess = await testRead();
    
    // Test Firestore write
    const writeSuccess = await testWrite();
    
    // Summary
    if (readSuccess && writeSuccess) {
      addResult("All tests passed! Firebase is configured correctly.");
    } else {
      addResult("Some tests failed. Check the Firebase console for more details.", false);
    }
    
    setLoading(false);
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Simple Firebase Test</h5>
      </Card.Header>
      <Card.Body>
        <Button 
          variant="primary" 
          onClick={runTests} 
          disabled={loading}
          className="mb-3"
        >
          {loading ? 'Running Tests...' : 'Run Simple Firebase Tests'}
        </Button>
        
        {results.length > 0 && (
          <div className="mt-3">
            <h6>Test Results:</h6>
            <div className="border rounded p-3 bg-light" style={{ maxHeight: '300px', overflowY: 'auto' }}>
              {results.map((result, index) => (
                <Alert key={index} variant={result.success ? 'success' : 'danger'} className="py-2 mb-2">
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

export default SimpleFirebaseTest;