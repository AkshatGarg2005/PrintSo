// src/components/PdfViewer.js
import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';

// Simple PDF viewer that uses an iframe for compatibility
const PdfViewer = ({ url, filename }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load PDF in the viewer");
    setIsLoading(false);
  };

  const handleDownload = () => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'document.pdf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      setError(`Failed to download: ${error.message}`);
    }
  };

  return (
    <div className="pdf-viewer-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0">{filename || 'PDF Document'}</h6>
        <div>
          <Button 
            variant="primary" 
            size="sm"
            onClick={handleDownload}
            className="me-2"
          >
            <i className="bi bi-download me-1"></i>
            Download
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => window.open(url, '_blank')}
          >
            <i className="bi bi-box-arrow-up-right me-1"></i>
            Open in New Tab
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center p-4">
          <Spinner animation="border" />
          <p className="mt-2">Loading PDF...</p>
        </div>
      )}

      {error && (
        <Alert variant="danger">
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-between align-items-center">
            <span>Try one of these alternatives:</span>
            <div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={handleDownload}
                className="me-2"
              >
                Download
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                onClick={() => window.open(url, '_blank')}
              >
                Open in New Tab
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <div className={`iframe-container ${isLoading ? 'loading' : ''}`} style={{ minHeight: '500px' }}>
        <iframe
          src={`${url}#toolbar=0&navpanes=0`}
          title="PDF Viewer"
          width="100%"
          height="600px"
          frameBorder="0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          style={{ 
            border: '1px solid #dee2e6',
            borderRadius: '0.25rem',
            display: error ? 'none' : 'block'
          }}
        />
      </div>
    </div>
  );
};

export default PdfViewer;