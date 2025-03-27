// src/components/PdfUploader.js
import React, { useRef } from 'react';
import { Button } from 'react-bootstrap';
import { pdfjs } from 'react-pdf';

// Set worker path to find pdf.worker.js file
// Using a specific version that we know works with the CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

const PdfUploader = ({ files, onFileChange, onRemove, disabled }) => {
  const fileInputRef = useRef(null);

  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const getPageCount = async (file) => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      
      fileReader.onload = async (event) => {
        try {
          const typedArray = new Uint8Array(event.target.result);
          const pdf = await pdfjs.getDocument({ data: typedArray }).promise;
          resolve(pdf.numPages);
        } catch (error) {
          console.error("Error getting PDF page count:", error);
          resolve(1); // Default to 1 page if error
        }
      };
      
      fileReader.readAsArrayBuffer(file);
    });
  };

  const handleFileInput = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    console.log("Selected files:", selectedFiles);
    
    // Filter for only PDF files
    const pdfFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf'
    );
    
    if (pdfFiles.length !== selectedFiles.length) {
      alert('Only PDF files are allowed!');
    }
    
    if (pdfFiles.length === 0) {
      return;
    }
    
    // Process files to get page counts and create our extended file objects
    const processedFiles = [];
    
    for (const file of pdfFiles) {
      try {
        // Get page count for the PDF
        const pageCount = await getPageCount(file);
        
        // Create a simple object that includes the original file and the page count
        processedFiles.push({
          file: file,           // The actual File object
          name: file.name,      // Name for display
          size: file.size,      // Size for display
          type: file.type,      // Type for validation
          pages: pageCount      // Page count for pricing
        });
      } catch (err) {
        console.error(`Error processing file ${file.name}:`, err);
      }
    }
    
    console.log("Processed files:", processedFiles);
    
    // Update parent component with processed files
    onFileChange(processedFiles);
    
    // Clear input value to allow re-selection of the same file
    e.target.value = null;
  };

  return (
    <div>
      <div className="file-upload-container" onClick={handleFileClick}>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".pdf"
          multiple
          style={{ display: 'none' }}
          disabled={disabled || files.length >= 5}
        />
        <div>
          <i className="bi bi-file-earmark-pdf" style={{ fontSize: '2rem' }}></i>
          <p className="mb-0">Click to select PDF files or drag & drop here</p>
          <p className="text-muted small">{files.length}/5 files uploaded</p>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="mb-3">
          <h6>Uploaded Files:</h6>
          {files.map((fileObj, index) => (
            <div key={index} className="file-item">
              <div>
                <i className="bi bi-file-earmark-pdf me-2"></i>
                {fileObj.name} 
                <span className="text-muted ms-2">({fileObj.pages || 1} pages)</span>
              </div>
              <Button 
                variant="outline-danger" 
                size="sm"
                onClick={() => onRemove(index)}
                disabled={disabled}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PdfUploader;