// src/App.js (for printso-admin) - With Delete Functionality (Requires correct Storage Policies)
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css'; // Ensure styles are linked

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null); // Track which order is being deleted

  // --- Constants ---
  const BUCKET_NAME = 'print-files'; // Your bucket name

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setOrders(data || []);

    } catch (err) {
      console.error("Error fetching orders:", err);
      setError(`Failed to fetch orders: ${err.message}.`);
    } finally {
      setLoading(false);
    }
  }

  // --- Download Handler ---
  const handleDownload = async (filePath, originalFileName) => {
    if (!filePath) {
      alert('Error: No file path associated with this order.');
      return;
    }
    try {
      console.log(`Attempting to get download URL for: ${filePath}`);
      // Try public URL first (requires SELECT policy for service_role)
      const { data: urlData, error: urlError } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      let downloadUrl;
      if (!urlError && urlData?.publicUrl) {
          console.log("Using public URL:", urlData.publicUrl);
          downloadUrl = urlData.publicUrl;
      } else {
          console.warn("Could not get public URL or bucket isn't public, trying signed URL. Error:", urlError);
          // Fallback to Signed URL (Requires SELECT policy for service_role)
          const { data: signedData, error: signedError } = await supabase.storage
            .from(BUCKET_NAME)
            .createSignedUrl(filePath, 300); // 5 minutes expiry

          if (signedError || !signedData?.signedUrl) {
            throw signedError || new Error("Failed to generate signed URL.");
          }
          console.log("Using signed URL:", signedData.signedUrl.substring(0, 50) + "...");
          downloadUrl = signedData.signedUrl;
      }
      initiateDownload(downloadUrl, originalFileName);

    } catch (error) {
      console.error('Error getting download URL:', error);
      alert(`Failed to get download link: ${error.message}`);
    }
  };

  const initiateDownload = (url, filename) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.substring(url.lastIndexOf('/') + 1);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  // --- End Download Handler ---


  // --- Delete Handler ---
  const handleDelete = async (orderId, filePath) => {
    if (!window.confirm(`Are you sure you want to delete order ID ${orderId}? This action cannot be undone.`)) {
      return;
    }

    setDeletingOrderId(orderId);
    setError(null);

    try {
      // 1. Delete file from Storage (if path exists)
      // Requires DELETE policy for service_role on the bucket
      if (filePath) {
        console.log(`Attempting to delete file: ${filePath} from bucket ${BUCKET_NAME}`);
        const { error: fileError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]); // remove expects an array

        if (fileError) {
          console.error("Error deleting file from storage:", fileError);
          // Decide if you want to stop or continue if file delete fails
          throw new Error(`Failed to delete file (${filePath}): ${fileError.message}. Order not deleted.`);
        }
        console.log(`Successfully deleted file: ${filePath}`);
      } else {
        console.log(`No file path for order ${orderId}, skipping file deletion.`);
      }

      // 2. Delete order from database
      console.log(`Attempting to delete order ID: ${orderId} from database.`);
      const { error: dbError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (dbError) {
        console.error("Error deleting order from database:", dbError);
        // NOTE: If DB delete fails, the file *might* have already been deleted.
        // Consider more robust transaction handling if this is critical.
        throw new Error(`Failed to delete order (ID ${orderId}) from database: ${dbError.message}`);
      }
      console.log(`Successfully deleted order ID: ${orderId} from database.`);

      // 3. Update local state
      setOrders(currentOrders => currentOrders.filter(order => order.id !== orderId));
      // alert(`Order ID ${orderId} deleted successfully.`); // Optional: uncomment for alert

    } catch (err) {
      console.error("Deletion process failed:", err);
      setError(`Deletion failed: ${err.message}`);
      alert(`Deletion failed: ${err.message}`); // Show alert on error
    } finally {
      setDeletingOrderId(null);
    }
  };
  // --- End Delete Handler ---


  return (
    <div className="AdminApp">
      <h1>Printso Admin - Orders</h1>

      <button onClick={fetchOrders} disabled={loading || deletingOrderId}>
        {loading ? 'Refreshing...' : 'Refresh Orders'}
      </button>

      {error && <p className="error-message">{error}</p>}
      {loading && !error && <p>Loading orders...</p>}
      {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

      {!loading && !error && orders.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Order Date</th>
              <th>Customer Name</th>
              <th>Phone</th>
              <th>Print Type</th>
              <th>Special Requests</th>
              <th>File</th>
              <th>Original Filename</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.customer_name}</td>
                <td>{order.customer_phone}</td>
                <td>{order.print_type}</td>
                <td>{order.special_requests || '-'}</td>
                <td>
                  {order.file_path ? (
                    <button
                      onClick={() => handleDownload(order.file_path, order.original_file_name)}
                      disabled={loading || !!deletingOrderId}
                    >
                      Download File
                    </button>
                  ) : (
                    'No file path'
                  )}
                </td>
                <td>{order.original_file_name || '(Not recorded)'}</td>
                <td>
                  <button
                    onClick={() => handleDelete(order.id, order.file_path)}
                    disabled={loading || !!deletingOrderId}
                    style={{ backgroundColor: '#f44336', color: 'white' }}
                  >
                    {deletingOrderId === order.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;