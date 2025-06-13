import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios'; // For API calls in the future
import { Link } from 'react-router-dom'; // Import Link

const MemberTrainingHistoryPage = () => {
  const { user, token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrainingHistory = async () => {
      setIsLoading(true);
      setError('');
      try {
        // In a real app, you would fetch this data from the backend
        // For example:
        // const response = await axios.get(`${process.env.REACT_APP_API_URL}/training/history/me`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // setHistory(response.data.history);

        // For now, we'll use mock data
        const mockHistory = [
          { id: 1, date: '2023-10-01', activity: 'Full Body Workout', duration: '60 mins', trainer: 'John Doe' },
          { id: 2, date: '2023-10-03', activity: 'Cardio Session', duration: '45 mins', trainer: null },
          { id: 3, date: '2023-10-05', activity: 'Strength Training - Legs', duration: '75 mins', trainer: 'Jane Smith' },
          { id: 4, date: '2023-10-08', activity: 'Yoga Class', duration: '60 mins', trainer: 'Alice Brown' },
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setHistory(mockHistory);
          setIsLoading(false);
        }, 1000);

      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch training history.');
        console.error('Training history fetch error:', err);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTrainingHistory();
    } else {
      // Handle case where user is not logged in, though typically pages like this are protected
      setIsLoading(false);
      setError("User not authenticated.");
    }
  }, [user, token]);

  if (isLoading) {
    return <p>Loading training history...</p>;
  }

  if (error) {
    return (
      <div>
        <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          &larr; Back to Dashboard
        </Link>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (history.length === 0 && !error) { // Ensure error isn't also shown
    return (
      <div>
        <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          &larr; Back to Dashboard
        </Link>
        <p>No training history found.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>My Training History</h2>
      {/* A more sophisticated display like a table could be used here */}
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {history.map((session) => (
          <li key={session.id} style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '4px' }}>
            <p><strong>Date:</strong> {session.date}</p>
            <p><strong>Activity:</strong> {session.activity}</p>
            <p><strong>Duration:</strong> {session.duration}</p>
            {session.trainer && <p><strong>Trainer:</strong> {session.trainer}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MemberTrainingHistoryPage;
