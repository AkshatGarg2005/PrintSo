// src/App.js (for printso-admin) - Enhanced UI
import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './App.css';

function App() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingOrderId, setDeletingOrderId] = useState(null);
  const [downloadingOrderId, setDownloadingOrderId] = useState(null);

  // --- Constants ---
  const BUCKET_NAME = 'print-files';

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
  const handleDownload = async (orderId, filePath, originalFileName) => {
    if (!filePath) {
      alert('Error: No file path associated with this order.');
      return;
    }
    
    setDownloadingOrderId(orderId);
    
    try {
      console.log(`Attempting to get download URL for: ${filePath}`);
      // Try public URL first
      const { data: urlData, error: urlError } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      let downloadUrl;
      if (!urlError && urlData?.publicUrl) {
          console.log("Using public URL:", urlData.publicUrl);
          downloadUrl = urlData.publicUrl;
      } else {
          console.warn("Could not get public URL or bucket isn't public, trying signed URL. Error:", urlError);
          // Fallback to Signed URL
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
    } finally {
      setDownloadingOrderId(null);
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

  // --- Delete Handler ---
  const handleDelete = async (orderId, filePath) => {
    if (!window.confirm(`Are you sure you want to delete order ID ${orderId}? This action cannot be undone.`)) {
      return;
    }

    setDeletingOrderId(orderId);
    setError(null);

    try {
      // 1. Delete file from Storage (if path exists)
      if (filePath) {
        console.log(`Attempting to delete file: ${filePath} from bucket ${BUCKET_NAME}`);
        const { error: fileError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath]);

        if (fileError) {
          console.error("Error deleting file from storage:", fileError);
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
        throw new Error(`Failed to delete order (ID ${orderId}) from database: ${dbError.message}`);
      }
      console.log(`Successfully deleted order ID: ${orderId} from database.`);

      // 3. Update local state
      setOrders(currentOrders => currentOrders.filter(order => order.id !== orderId));

    } catch (err) {
      console.error("Deletion process failed:", err);
      setError(`Deletion failed: ${err.message}`);
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setDeletingOrderId(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="AdminApp">
      <h1>Printso Admin Dashboard</h1>

      <div className="control-panel">
        <button 
          className="refresh-button"
          onClick={fetchOrders} 
          disabled={loading || !!deletingOrderId}
        >
          {loading ? (
            <>
              <span className="refresh-icon"></span>
              Refreshing...
            </>
          ) : (
            'Refresh Orders'
          )}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}
      
      {loading && !error && (
        <div className="status-message">Loading orders...</div>
      )}
      
      {!loading && !error && orders.length === 0 && (
        <div className="status-message">No orders found.</div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order Date</th>
                <th>Customer</th>
                <th>Phone</th>
                <th>Print Type</th>
                <th>Special Requests</th>
                <th>File</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr 
                  key={order.id}
                  className={
                    deletingOrderId === order.id || downloadingOrderId === order.id 
                      ? 'table-row-loading' 
                      : ''
                  }
                >
                  <td className="order-date">
                    {formatDate(order.created_at)}
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.customer_phone}</td>
                  <td>{order.print_type}</td>
                  <td>
                    {order.special_requests || <span className="empty-value">None</span>}
                  </td>
                  <td>
                    {order.original_file_name || <span className="empty-value">No filename</span>}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {order.file_path && (
                        <button
                          className="action-button download-button"
                          onClick={() => handleDownload(order.id, order.file_path, order.original_file_name)}
                          disabled={loading || !!deletingOrderId || downloadingOrderId === order.id}
                        >
                          {downloadingOrderId === order.id ? 'Downloading...' : 'Download'}
                        </button>
                      )}
                      <button
                        className="action-button delete-button"
                        onClick={() => handleDelete(order.id, order.file_path)}
                        disabled={loading || !!deletingOrderId || !!downloadingOrderId}
                      >
                        {deletingOrderId === order.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;