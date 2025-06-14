import React, { useState, useEffect, useContext, useCallback } from 'react'; // 1. Import useCallback
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

const StaffFeedbackManagementPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [newStatus, setNewStatus] = useState('In Progress');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { auth } = useContext(AuthContext);

  // 2. Define fetchFeedback in the main component scope using useCallback
  const fetchFeedback = useCallback(async () => {
    if (!auth || !auth.token) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/feedback`, config);
      setFeedbackList(res.data);
    } catch (err) {
      setError('Failed to load feedback. You may not have permission.');
      console.error("Fetch feedback error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [auth]); // Its dependency is the `auth` object.

  // 3. The useEffect hook now simply calls the function when it changes.
  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  const handleSelectFeedback = (feedback) => {
    setSelectedFeedback(feedback);
    setResolutionNotes(feedback.resolutionNotes || '');
  };

  // 4. This function can now correctly see and call fetchFeedback.
  const handleSubmitResponse = async (e) => {
    e.preventDefault();
    if (!resolutionNotes) {
      alert('Resolution notes cannot be empty.');
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const body = { resolutionNotes, newStatus };
      await axios.put(`${process.env.REACT_APP_API_URL}/feedback/${selectedFeedback.feedback_id}`, body, config);
      
      alert('Feedback updated successfully!');
      setSelectedFeedback(null);
      fetchFeedback(); // This call now works perfectly.
    } catch (err) {
      alert('Failed to update feedback.');
    }
  };

  // --- RENDER LOGIC (No changes are needed in the JSX below) ---
  if (isLoading) return <p>Loading feedback...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  // ... The rest of your JSX rendering code remains exactly the same ...
  if (selectedFeedback) {
    return (
        <div>
            <button onClick={() => setSelectedFeedback(null)}>← Back to List</button>
            <h2>Process Feedback ID: {selectedFeedback.feedback_id}</h2>
            <p><strong>From Member:</strong> {selectedFeedback.SubmittingMember.Profile.full_name}</p>
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
      <h2>Process Member Feedback</h2>
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
                  <td><span className={`status-badge status-${item.status.toLowerCase()}`}>{item.status}</span></td>
                  <td>{item.SubmittingMember?.Profile?.full_name || 'N/A'}</td>
                  <td>{item.feedbackType}</td>
                  <td>{item.rating ? `${item.rating} ★` : 'N/A'}</td>
                  <td>{item.comments.substring(0, 50)}...</td>
                  <td>{new Date(item.created_at).toLocaleDateString()}</td>
                  <td><button className="btn-view" onClick={() => handleSelectFeedback(item)}>View/Process</button></td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>No feedback submitted yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StaffFeedbackManagementPage;