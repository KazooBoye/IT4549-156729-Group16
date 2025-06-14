import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

const MemberTrainingHistoryPage = () => {
  const { user, token } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTrainingHistory = async () => {
      if (!token) {
        setError("Authentication token not found.");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/members/training-history`, {
          headers: { 'x-auth-token': token } // Adjust header if using Bearer token
        });
        setHistory(response.data.history);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch training history.');
        console.error('Training history fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTrainingHistory();
    } else {
      setIsLoading(false);
      setError("User not authenticated. Please login.");
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

  if (history.length === 0 && !error) {
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
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ background: '#e3e3e3' }}>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Ngày tập</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Tên buổi tập</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Loại buổi tập</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Thời gian tập</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Gói tập</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Huấn luyện viên</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Mức độ tham gia</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Nhận xét của HLV</th>
          </tr>
        </thead>
        <tbody>
          {history.map((session) => (
            <tr key={session.id}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.session_date}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.session_name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.session_type}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.duration}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.package_name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.trainer_name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.completion_percentage !== null ? `${session.completion_percentage}%` : 'N/A'}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.trainer_notes_on_completion || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemberTrainingHistoryPage;
