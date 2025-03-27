// src/components/FirebaseConfigCheck.js
import React from 'react';
import { Card, Alert } from 'react-bootstrap';
import { app } from '../firebase';  // Import the app from single firebase.js

const FirebaseConfigCheck = () => {
  let firebaseConfig = null;
  let error = null;

  try {
    // Get the configuration from the existing app
    firebaseConfig = app ? app.options : null;
    
    if (!firebaseConfig) {
      throw new Error("Firebase app not initialized");
    }
  } catch (err) {
    error = err.message;
  }

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>Firebase Configuration Check</h5>
      </Card.Header>
      <Card.Body>
        {error ? (
          <Alert variant="danger">
            <strong>Error:</strong> {error}
          </Alert>
        ) : (
          <>
            <Alert variant="info">
              <strong>Your Firebase Configuration:</strong>
            </Alert>
            <div className="bg-light p-3 rounded">
              <pre className="mb-0">
                <code>
                  {JSON.stringify({
                    apiKey: firebaseConfig.apiKey ? "✓ Present" : "❌ Missing",
                    authDomain: firebaseConfig.authDomain ? "✓ Present" : "❌ Missing",
                    projectId: firebaseConfig.projectId,
                    storageBucket: firebaseConfig.storageBucket ? "✓ Present" : "❌ Missing",
                    messagingSenderId: firebaseConfig.messagingSenderId ? "✓ Present" : "❌ Missing",
                    appId: firebaseConfig.appId ? "✓ Present" : "❌ Missing"
                  }, null, 2)}
                </code>
              </pre>
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default FirebaseConfigCheck;