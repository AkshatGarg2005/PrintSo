// src/App.js (printso-client) - Testing with 'returning: minimal'
import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import './App.css'; // Ensure styles are in App.css

function App() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [printType, setPrintType] = useState('Black & White');
  const [specialRequests, setSpecialRequests] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [fileNameDisplay, setFileNameDisplay] = useState('No file chosen');

  const BUCKET_NAME = 'print-files';

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
      setFileNameDisplay(selectedFile.name);
      setMessage('');
    } else {
      setFile(null);
      setFileNameDisplay('No file chosen');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setMessage('Error: Please select a file to upload.');
      return;
    }
    if (!name || !phone) {
      setMessage('Error: Please enter your name and phone number.');
      return;
    }

    setUploading(true);
    setMessage('Uploading file and submitting order...');
    let uploadedFilePath = null;

    try {
      // 1. Upload file
      const fileExt = file.name.split('.').pop();
      const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `public/${uniqueFileName}`;
      uploadedFilePath = filePath;

      console.log(`Uploading to bucket: ${BUCKET_NAME}, path: ${filePath}`);
      let { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

      if (uploadError) {
        console.error("Upload Error:", uploadError);
        throw new Error(`File Upload Failed: ${uploadError.message}`); // Simplified error
      }

      console.log("File upload successful. Proceeding to insert order.");

      // --- Prepare data ---
      const orderData = {
        customer_name: name,
        customer_phone: phone,
        print_type: printType,
        special_requests: specialRequests || null,
        file_path: filePath,
        original_file_name: file.name
      };
      console.log("Attempting to insert this data:", JSON.stringify(orderData, null, 2));

      // 2. Insert order details with 'returning: minimal'
      // *** MODIFIED INSERT CALL ***
      const { error: insertError } = await supabase
        .from('orders')
        .insert([orderData], {
            returning: 'minimal' // Match curl prefer header
            // defaultToNull defaults to true, which is usually fine
        });
        // Note: .select() cannot be used with returning: 'minimal'

      // Check for insert errors
      if (insertError) {
        console.error("Database Insert Error:", insertError);
        // Attempt cleanup
        console.log(`Insert failed, attempting to remove uploaded file: ${uploadedFilePath}`);
        if (uploadedFilePath) {
          const { error: removeError } = await supabase.storage.from(BUCKET_NAME).remove([uploadedFilePath]);
          if (removeError) console.error("Failed to remove file after insert error:", removeError);
          else console.log("Successfully removed file after insert error.");
        }
        // Throw specific error based on code/message
        if (insertError.code === '42501' || (insertError.message && insertError.message.includes('violates row-level security policy'))) {
          throw new Error(`Order Submission Failed: Database auth/policy error from client (Code: ${insertError.code}). Even with minimal return.`);
        } else if (insertError.message && insertError.message.includes('null value in column')) {
          throw new Error(`Order Submission Failed: Required field missing (DB Error: ${insertError.message})`);
        }
        throw new Error(`Order Submission Failed: Database error - ${insertError.message} (Code: ${insertError.code})`);
      }

      // Success (determined by lack of error when using returning: minimal)
      // 'data' will be null here, so we can't log it
      console.log("Order insert successful (minimal return).");
      setMessage('Order submitted successfully! Thank you.');
      // Reset form
      setName('');
      setPhone('');
      setPrintType('Black & White');
      setSpecialRequests('');
      setFile(null);
      setFileNameDisplay('No file chosen');
      const fileInput = document.getElementById('file-input');
      if (fileInput) fileInput.value = "";

    } catch (error) {
      setMessage(`Error: ${error.message}`);
      console.error('Submission process error:', error);
    } finally {
      setUploading(false);
    }
  };

  const cost = printType === 'Color' ? 'Rs. 8/page' : 'Rs. 3/page';

  return (
    <div className="App">
      <h1>Welcome to Printso!</h1>
      <p>Upload your document and submit your print order.</p>

      <form onSubmit={handleSubmit}>
        {/* Form fields remain the same */}
         <div>
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={uploading}
              />
            </div>
            <div>
              <label htmlFor="phone">Phone Number:</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={uploading}
              />
            </div>
            <div>
              <label htmlFor="printType">Print Type:</label>
              <select
                id="printType"
                value={printType}
                onChange={(e) => setPrintType(e.target.value)}
                disabled={uploading}
              >
                <option value="Black & White">Black & White (Rs. 3/page)</option>
                <option value="Color">Color (Rs. 8/page)</option>
              </select>
              <span> - Estimated cost: {cost}</span>
            </div>
             <div>
              <label htmlFor="file-input">Choose File:</label>
              <input
                type="file"
                id="file-input"
                onChange={handleFileChange}
                required
                disabled={uploading}
              />
               <span style={{ marginLeft: '10px' }}>{fileNameDisplay}</span>
            </div>
            <div>
              <label htmlFor="specialRequests">Special Requests:</label>
              <textarea
                id="specialRequests"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="e.g., Spiral binding, Stick file, Double-sided printing..."
                rows="3"
                disabled={uploading}
              />
            </div>
            <button type="submit" disabled={uploading || !file}>
              {uploading ? 'Submitting...' : 'Submit Order'}
            </button>
      </form>

      {message && (
          <p className={`message ${message.startsWith('Error:') ? 'error' : 'success'}`}>
              {message}
          </p>
      )}
    </div>
  );
}

export default App;