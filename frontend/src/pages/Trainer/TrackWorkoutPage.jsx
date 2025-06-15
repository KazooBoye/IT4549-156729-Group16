import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const TrackWorkoutPage = () => {
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const  auth  = useContext(AuthContext);

    const [newSessionData, setNewSessionData] = useState({
        sessionDatetime: '',
        exercisePlan: '',
        durationMinutes: 60,
        notes: ''
    });

    // This function now lives in the main scope.
    const fetchAssignedMembers = async () => {
        if (!auth || !auth.token) {
            setIsLoading(false);
            setError('Could not verify authentication.');
            return;
        }
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/members`, config);
            setMembers(res.data);
        } catch (err) {
            setError('Không thể tải danh sách hội viên.');
        } finally {
            setIsLoading(false);
        }
    };

    // This useEffect hook calls the function above.
    // It depends on `auth` to re-fetch if the user logs in/out.
    useEffect(() => {
        fetchAssignedMembers();
    }, [auth]);

    const handleMemberSelect = async (member) => {
        setSelectedMember(member);
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/member/${member.user_id}/sessions`, config);
            setSessions(res.data);
        } catch(err) {
            setError('Không thể tải lịch tập của hội viên này.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSessionSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const body = { ...newSessionData, memberId: selectedMember.user_id };
            await axios.post(`${process.env.REACT_APP_API_URL}/trainer/sessions`, body, config);
            alert('Thêm buổi tập thành công!');
            setNewSessionData({ sessionDatetime: '', exercisePlan: '', durationMinutes: 60, notes: '' });
            handleMemberSelect(selectedMember); // Refresh session list
        } catch (err) {
            alert('Thêm buổi tập thất bại.');
        }
    };

    const handleStatusUpdate = async (sessionId, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const body = { status: newStatus };
            await axios.put(`${process.env.REACT_APP_API_URL}/trainer/sessions/${sessionId}`, body, config);
            alert('Cập nhật trạng thái thành công!');
            handleMemberSelect(selectedMember); // Refresh session list
        } catch (err) {
            alert('Cập nhật thất bại.');
        }
    };

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
    <div className="management-page-container">
      <Link to="/dashboard" className="btn-back-dashboard">← Quay lại Dashboard</Link>
      <h2 style={{ marginTop: '1rem' }}>Theo dõi và Cập nhật Lịch tập</h2>

      {/* --- Member Selection Section --- */}
      <div className="page-header">
        <h4>{!selectedMember ? "Vui lòng chọn một học viên:" : `Đang quản lý học viên: ${selectedMember.Profile.full_name}`}</h4>
        {selectedMember && (
          <button onClick={() => setSelectedMember(null)} className="btn-secondary">← Chọn học viên khác</button>
        )}
      </div>

      {!selectedMember ? (
        <div className="member-selection-list">
          {members.length > 0 ? members.map(member => (
            <button key={member.user_id} onClick={() => handleMemberSelect(member)} className="member-select-button">
              {member.Profile.full_name}
            </button>
          )) : <p>Không có học viên nào được phân công.</p>}
        </div>
      ) : (
        // --- Session Management Section ---
        <div className="session-management-view">
          {/* Add Session Form */}
          <div className="form-card">
            <h4>Thêm buổi tập mới</h4>
            <form onSubmit={handleAddSessionSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Ngày & Giờ tập:</label>
                  <input type="datetime-local" value={newSessionData.sessionDatetime} onChange={e => setNewSessionData({...newSessionData, sessionDatetime: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Thời lượng (phút):</label>
                  <input type="number" placeholder="60" value={newSessionData.durationMinutes} onChange={e => setNewSessionData({...newSessionData, durationMinutes: e.target.value})} required />
                </div>
              </div>
              <div className="form-group">
                <label>Nội dung bài tập (VD: Ngực, Vai, Tay sau):</label>
                <textarea value={newSessionData.exercisePlan} onChange={e => setNewSessionData({...newSessionData, exercisePlan: e.target.value})} required rows="4"></textarea>
              </div>
              <div className="form-group">
                <label>Ghi chú của HLV:</label>
                <input type="text" placeholder="Ghi chú về buổi tập..." value={newSessionData.notes} onChange={e => setNewSessionData({...newSessionData, notes: e.target.value})} />
              </div>
              <button type="submit" className="btn-primary">Thêm Buổi Tập</button>
            </form>
          </div>

          {/* Session List */}
          <div className="session-list">
            <h4>Các buổi tập đã lên lịch</h4>
            {isLoading ? <p>Đang tải lịch tập...</p> : sessions.length > 0 ? sessions.map(session => (
              <div key={session.session_id} className="session-item">
                <div className="session-header">
                  <strong>Ngày: {new Date(session.sessionDatetime).toLocaleString('vi-VN')}</strong>
                  <span className={`status-badge status-${session.status.toLowerCase()}`}>{session.status}</span>
                </div>
                <div className="session-body">
                    <p><strong>Nội dung:</strong> {session.exercisePlan}</p>
                    {session.trainerNotes && <p><strong>Ghi chú:</strong> {session.trainerNotes}</p>}
                </div>
                {session.status === 'Planned' && (
                  <div className="session-actions">
                    <button className="btn-action btn-complete" onClick={() => handleStatusUpdate(session.session_id, 'Completed')}>Đánh dấu Hoàn thành</button>
                    <button className="btn-action btn-missed" onClick={() => handleStatusUpdate(session.session_id, 'Missed')}>Đánh dấu Vắng</button>
                  </div>
                )}
              </div>
            )) : <p className="no-data-cell">Chưa có buổi tập nào được lên lịch cho học viên này.</p>}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackWorkoutPage;