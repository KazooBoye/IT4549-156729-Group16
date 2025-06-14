import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

const TrainerMemberProgressPage = () => {
  const { user, token } = useContext(AuthContext);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberHistory, setMemberHistory] = useState([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSession, setNewSession] = useState({
    session_name: '',
    activity_type: '',
    check_in_time: '',
    check_out_time: '',
    completion_percentage: '',
    trainer_notes_on_completion: '',
    // subscription_id: '', // Optional: could be a dropdown of member's active subscriptions
  });

  // Fetch members associated with the trainer
  useEffect(() => {
    const fetchMembers = async () => {
      if (!token) return;
      setIsLoadingMembers(true);
      setError('');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/members`, {
          headers: { 'x-auth-token': token },
        });
        setMembers(res.data);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch members.');
        console.error(err);
      } finally {
        setIsLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [token]);

  // Fetch history for selected member
  useEffect(() => {
    const fetchMemberHistory = async () => {
      if (!selectedMember || !token) {
        setMemberHistory([]);
        return;
      }
      setIsLoadingHistory(true);
      setError('');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/member-history/${selectedMember.user_id}`, {
          headers: { 'x-auth-token': token },
        });
        setMemberHistory(res.data.history);
      } catch (err) {
        setError(err.response?.data?.msg || `Failed to fetch history for ${selectedMember.full_name}.`);
        console.error(err);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    fetchMemberHistory();
  }, [selectedMember, token]);

  const handleMemberSelect = (member) => {
    setSelectedMember(member);
    setShowAddForm(false); // Close form when changing member
    setSuccess('');
    setError('');
  };

  const handleNewSessionChange = (e) => {
    setNewSession({ ...newSession, [e.target.name]: e.target.value });
  };

  const handleAddSessionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMember || !token) return;
    setError('');
    setSuccess('');
    try {
      const sessionData = {
        ...newSession,
        member_user_id: selectedMember.user_id,
        check_in_time: newSession.check_in_time ? new Date(newSession.check_in_time).toISOString() : null,
        check_out_time: newSession.check_out_time ? new Date(newSession.check_out_time).toISOString() : null,
        completion_percentage: newSession.completion_percentage ? parseInt(newSession.completion_percentage) : null,
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/trainer/workout-session`, sessionData, {
        headers: { 'x-auth-token': token },
      });
      setSuccess('Workout session added successfully!');
      setShowAddForm(false);
      setNewSession({ session_name: '', activity_type: '', check_in_time: '', check_out_time: '', completion_percentage: '', trainer_notes_on_completion: '' });
      // Refresh history
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/member-history/${selectedMember.user_id}`, {
        headers: { 'x-auth-token': token },
      });
      setMemberHistory(res.data.history);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to add session.');
      console.error(err);
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Theo dõi và Cập nhật Tiến độ Học viên</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <div>
        <h4>Chọn Học viên:</h4>
        {isLoadingMembers ? <p>Loading members...</p> : (
          <select onChange={(e) => {
            const member = members.find(m => m.user_id === parseInt(e.target.value));
            if (member) handleMemberSelect(member); else setSelectedMember(null);
          }}
            value={selectedMember ? selectedMember.user_id : ''}
            style={{ padding: '8px', minWidth: '200px', marginBottom: '20px' }}
          >
            <option value="">-- Select a Member --</option>
            {members.map(m => (
              <option key={m.user_id} value={m.user_id}>{m.full_name} ({m.email})</option>
            ))}
          </select>
        )}
      </div>

      {selectedMember && (
        <div>
          <h3>Tiến độ của: {selectedMember.full_name}</h3>
          <button onClick={() => setShowAddForm(!showAddForm)} style={{ marginBottom: '10px', padding: '8px 12px' }}>
            {showAddForm ? 'Hủy Thêm Buổi Tập' : 'Thêm Buổi Tập Mới'}
          </button>

          {showAddForm && (
            <form onSubmit={handleAddSessionSubmit} style={{ border: '1px solid #ccc', padding: '15px', marginBottom: '20px', borderRadius: '5px' }}>
              <h4>Thêm Buổi Tập Mới</h4>
              <div>
                <label>Tên Buổi Tập:</label>
                <input type="text" name="session_name" value={newSession.session_name} onChange={handleNewSessionChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Loại Buổi Tập (Activity Type):</label>
                <input type="text" name="activity_type" value={newSession.activity_type} onChange={handleNewSessionChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Thời Gian Check-in:</label>
                <input type="datetime-local" name="check_in_time" value={newSession.check_in_time} onChange={handleNewSessionChange} required style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Thời Gian Check-out:</label>
                <input type="datetime-local" name="check_out_time" value={newSession.check_out_time} onChange={handleNewSessionChange} style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Mức Độ Hoàn Thành (%):</label>
                <input type="number" name="completion_percentage" value={newSession.completion_percentage} onChange={handleNewSessionChange} min="0" max="100" style={{ width: '100%', padding: '8px', marginBottom: '10px' }} />
              </div>
              <div>
                <label>Ghi Chú của Huấn Luyện Viên:</label>
                <textarea name="trainer_notes_on_completion" value={newSession.trainer_notes_on_completion} onChange={handleNewSessionChange} style={{ width: '100%', padding: '8px', marginBottom: '10px', minHeight: '80px' }} />
              </div>
              <button type="submit" style={{ padding: '10px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Lưu Buổi Tập</button>
            </form>
          )}

          <h4>Lịch Sử Tập Luyện:</h4>
          {isLoadingHistory ? <p>Loading history...</p> : memberHistory.length > 0 ? (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#e3e3e3' }}>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Ngày</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Tên Buổi Tập</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Loại</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Thời Gian</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>HLV Ghi Nhận</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Hoàn Thành</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Ghi Chú HLV</th>
                  {/* Add actions column for edit/delete later */}
                </tr>
              </thead>
              <tbody>
                {memberHistory.map(session => (
                  <tr key={session.id}>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.session_date}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.session_name}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.session_type}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.duration}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.trainer_name} {user && session.recorded_by_user_id === user.id ? "(Bạn)" : ""}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.completion_percentage !== null ? `${session.completion_percentage}%` : 'N/A'}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8 }}>{session.trainer_notes_on_completion || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>No training history found for this member.</p>}
        </div>
      )}
    </div>
  );
};

export default TrainerMemberProgressPage;
