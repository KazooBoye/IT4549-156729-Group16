import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';
import { Link } from 'react-router-dom'
// import './StaffFeedbackManagementPage.css'; // Make sure you have the CSS file linked

const StaffFeedbackManagementPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // We still need the context for the UPDATE action
  const { auth } = useContext(AuthContext);

  // This function fetches the data once on component mount.
  const fetchFeedback = async () => {
    setIsLoading(true);
    setError('');

    // --- The Key Change is Here ---
    const token = localStorage.getItem('token');

    if (!token) {
      setError('You must be logged in to view feedback.');
      setIsLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/feedback`, config);
      setFeedbackList(res.data);
    } catch (err) {
      setError('Failed to load feedback. You may not have permission.');
      console.error("Fetch feedback error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, []); // <-- Empty dependency array to run only once.

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResolutionNotes(feedback.resolutionNotes || '');
  };

  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      return alert('Authentication error. Please log in again.');
    }
    if (!resolutionNotes) {
      return alert('Resolution notes cannot be empty.');
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { resolutionNotes, newStatus };
      await axios.put(`${process.env.REACT_APP_API_URL}/feedback/${selectedFeedback.feedback_id}`, body, config);
      
      alert('Feedback updated successfully!');
      setSelectedFeedback(null);
      fetchFeedback(); // Re-fetch the list to show the update.
    } catch (err) {
      alert('Failed to update feedback.');
    }
  };

  // --- RENDER LOGIC (No changes needed here) ---
  if (isLoading) return <p>Loading feedback...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  if (selectedFeedback) {
    return (
      <div>
        <button onClick={() => setSelectedFeedback(null)}>← Back to List</button>
        <h2>Process Feedback ID: {selectedFeedback.feedback_id}</h2>
        <p><strong>From Member:</strong> {selectedFeedback.SubmittingMember?.Profile?.full_name || 'N/A'}</p>
        <p><strong>Feedback Type:</strong> {selectedFeedback.feedbackType}</p>
        {selectedFeedback.rating && <p><strong>Rating:</strong> {selectedFeedback.rating} / 5</p>}
        <p><strong>Member's Comments:</strong></p>
        <div style={{border: '1px solid #ccc', padding: '10px', background: '#f9f9f9'}}>
            <p>{selectedFeedback.comments}</p>
        </div>
        <form onSubmit={handleSubmitResponse} style={{marginTop: '1rem'}}>
            <label>Resolution Notes:</label>
            <textarea 
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows="5" style={{width: '100%', display: 'block'}} required
            ></textarea>
            <label>Set New Status:</label>
            <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
            </select>
            <button type="submit">Update Feedback</button>
        </form>
      </div>
    );
  }

  return (
    <div className="feedback-management-container">
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h2 style={{marginTop: '1rem'}}>Process Member Feedback</h2>

      {error && <p style={{color: 'red'}}>{error}</p>}
      <div className="feedback-table-wrapper">
        <table className="feedback-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>From</th>
              <th>Type</th>
              <th>Rating</th>
              <th>Comments</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {feedbackList.length > 0 ? (
              feedbackList.map(item => (
                <tr key={item.feedback_id}>
                  <td><span className={`status-badge status-${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                  <td>{item.SubmittingMember?.Profile?.full_name || 'N/A'}</td>
                  <td>{item.feedbackType}</td>
                  <td>{item.rating || 'N/A'}</td>
                  <td>{item.comments.substring(0, 50)}...</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td><button className="btn-view" onClick={() => handleSelectFeedback(item)}>View/Process</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                    {error ? 'Could not load data.' : 'No feedback submitted yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffFeedbackManagementPage;