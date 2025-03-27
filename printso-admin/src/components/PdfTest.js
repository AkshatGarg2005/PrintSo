// src/components/PdfTest.js
import React, { useState } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import PdfViewer from './PdfViewer';

const PdfTest = () => {
  const [pdfUrl, setPdfUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPdf, setShowPdf] = useState(false);
  const [testResults, setTestResults] = useState([]);

  const addResult = (message, success = true) => {
    setTestResults(prev => [...prev, { message, success, timestamp: new Date().toISOString() }]);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const handlePdfUrlChange = (e) => {
    setPdfUrl(e.target.value);
    setShowPdf(false);
  };

  const handleTestPdf = () => {
    if (!pdfUrl.trim()) {
      addResult('Please enter a PDF URL', false);
      return;
    }

    clearResults();
    setIsLoading(true);
    setShowPdf(false);
    
    addResult(`Testing PDF URL: ${pdfUrl}`);
    
    // Test if URL is accessible
    fetch(pdfUrl, { method: 'HEAD' })
      .then(response => {
        if (response.ok) {
          addResult(`URL is accessible (Status: ${response.status})`);
          setShowPdf(true);
        } else {
          addResult(`URL returned status: ${response.status} ${response.statusText}`, false);
        }
        setIsLoading(false);
      })
      .catch(error => {
        addResult(`Failed to access URL: ${error.message}`, false);
        setIsLoading(false);
      });
  };

  const handleDownloadFile = () => {
    try {
      // Create an invisible anchor element
      const a = document.createElement('a');
      a.href = pdfUrl;
      a.download = 'download.pdf';
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      
      // Append to body, click, and remove
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      addResult('Download initiated');
    } catch (error) {
      console.error("Error initiating download:", error);
      addResult(`Failed to download file: ${error.message}`, false);
    }
  };

  return (
    <Card className="mb-4">
      <Card.Header>
        <h5>PDF File Tester</h5>
      </Card.Header>
      <Card.Body>
        <Form.Group className="mb-3">
          <Form.Label>Enter PDF URL to Test</Form.Label>
          <Form.Control
            type="text"
            value={pdfUrl}
            onChange={handlePdfUrlChange}
            placeholder="https://example.com/path/to/file.pdf"
          />
        </Form.Group>
        
        <div className="mb-4">
          <Button 
            variant="primary" 
            onClick={handleTestPdf}
            disabled={!pdfUrl.trim() || isLoading}
            className="me-2"
          >
            {isLoading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Testing...
              </>
            ) : 'Test PDF'}
          </Button>
          
          <Button 
            variant="outline-primary" 
            onClick={handleDownloadFile}
            disabled={!pdfUrl.trim()}
          >
            Download PDF
          </Button>
          
          <Button 
            variant="outline-secondary" 
            onClick={() => window.open(pdfUrl, '_blank')}
            disabled={!pdfUrl.trim()}
            className="ms-2"
          >
            Open in New Tab
          </Button>
        </div>
        
        {testResults.length > 0 && (
          <div className="mb-4">
            <h6>Test Results:</h6>
            <div className="border rounded p-3 bg-light" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {testResults.map((result, index) => (
                <Alert key={index} variant={result.success ? 'info' : 'danger'} className="py-1 mb-2">
                  {result.message}
                </Alert>
              ))}
            </div>
          </div>
        )}
        
        {showPdf && (
          <div className="mt-4">
            <h6>PDF Preview:</h6>
            <PdfViewer 
              url={pdfUrl}
              filename="test-document.pdf"
            />
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PdfTest;