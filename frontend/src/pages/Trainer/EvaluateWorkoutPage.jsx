import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const EvaluateWorkoutPage = () => {
    // --- State for the main workflow ---
    const [members, setMembers] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [sessions, setSessions] = useState([]);
    const [sessionToEvaluate, setSessionToEvaluate] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const  auth  = useContext(AuthContext);

    // --- State for the evaluation form itself ---
    const [evaluationData, setEvaluationData] = useState({
        evaluationScore: 5,
        evaluationComments: '',
        goalCompletionStatus: 'Met',
        suggestionsForNextSession: ''
    });

    // --- Step 1 & 2: Fetch the trainer's assigned members ---
      // This useEffect will fetch the trainer's assigned members
  useEffect(() => {
    // Define the async function inside the effect
    const fetchAssignedMembers = async () => {
      // This is the crucial check. If the auth token isn't ready, we stop.
      if (!auth || !auth.token) {
        // We set loading to false to ensure the UI doesn't get stuck.
        setIsLoading(false);
        // We can set an error to be more user-friendly.
        // setError('Could not verify authentication. Please log in again.');
        return;
      }

      // If we have a token, we can now safely proceed.
      setIsLoading(true);
      setError('');

      try {
        const config = { headers: { Authorization: `Bearer ${auth.token}` } };
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/members`, config);
        setMembers(res.data);
      } catch (err) {
        setError('Không thể tải danh sách hội viên.');
        console.error("Error fetching assigned members:", err);
      } finally {
        // This always runs, ensuring the "Loading..." message is removed.
        setIsLoading(false);
      }
    };

    fetchAssignedMembers();
  }, [auth]); // The dependency on `auth` is what makes this work.

    // --- Step 3 & 4: Handle member selection and fetch their sessions ---
    const handleMemberSelect = async (member) => {
        setSelectedMember(member);
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/member/${member.user_id}/sessions`, config);
            // Filter to only show sessions that can be evaluated
            setSessions(res.data.filter(s => s.status === 'Completed'));
        } catch(err) {
            setError('Không thể tải lịch tập của học viên này.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Step 5, 6, 7: Handle session selection and prepare the evaluation form ---
    const handleOpenEvaluation = (session) => {
        setSessionToEvaluate(session);
        setEvaluationData({
            evaluationScore: session.evaluationScore || 5,
            evaluationComments: session.evaluationComments || '',
            goalCompletionStatus: session.goalCompletionStatus || 'Met',
            suggestionsForNextSession: session.suggestionsForNextSession || ''
        });
    };

    // --- Step 8 & 9: Handle submission of the evaluation form ---
    const handleEvaluationSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/trainer/sessions/${sessionToEvaluate.session_id}`, evaluationData, config);
            alert('Đánh giá thành công!');
            setSessionToEvaluate(null); // Go back to the session list
            handleMemberSelect(selectedMember); // Refresh the list
        } catch (err) {
            alert('Đánh giá thất bại.');
        }
    };

    // --- RENDER LOGIC ---

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    // --- Render the evaluation form itself ---
    if (sessionToEvaluate) {
        return (
            <div className="management-page-container">
                <button onClick={() => setSessionToEvaluate(null)}>← Quay lại danh sách buổi tập</button>
                <h3>Đánh giá buổi tập: {new Date(sessionToEvaluate.sessionDatetime).toLocaleString('vi-VN')}</h3>
                <form onSubmit={handleEvaluationSubmit} className="edit-form">
                    <div>
                        <label>Điểm đánh giá (0-10): {evaluationData.evaluationScore}</label>
                        <input type="range" min="0" max="10" value={evaluationData.evaluationScore} onChange={e => setEvaluationData({...evaluationData, evaluationScore: e.target.value})} />
                    </div>
                    <div>
                        <label>Nhận xét chuyên môn:</label>
                        <textarea value={evaluationData.evaluationComments} onChange={e => setEvaluationData({...evaluationData, evaluationComments: e.target.value})} required rows="4"></textarea>
                    </div>
                    <div>
                        <label>Mức độ hoàn thành mục tiêu:</label>
                        <select value={evaluationData.goalCompletionStatus} onChange={e => setEvaluationData({...evaluationData, goalCompletionStatus: e.target.value})}>
                            <option value="Met">Đạt</option>
                            <option value="Exceeded">Vượt mong đợi</option>
                            <option value="Not Met">Chưa đạt</option>
                        </select>
                    </div>
                    <div>
                        <label>Đề xuất cải thiện cho buổi sau:</label>
                        <input type="text" value={evaluationData.suggestionsForNextSession} onChange={e => setEvaluationData({...evaluationData, suggestionsForNextSession: e.target.value})} />
                    </div>
                    <button type="submit">Lưu Đánh giá</button>
                </form>
            </div>
        )
    }
    
    // --- Render the list of sessions for the selected member ---
    if (selectedMember) {
        return (
            <div className="management-page-container">
                 <button onClick={() => setSelectedMember(null)}>← Chọn học viên khác</button>
                 <h3>Chọn buổi tập để đánh giá cho: {selectedMember.Profile.full_name}</h3>
                 <div className="session-list">
                    {sessions.length > 0 ? sessions.map(session => (
                        <div key={session.session_id} className="session-item">
                            <p><strong>Ngày:</strong> {new Date(session.sessionDatetime).toLocaleString('vi-VN')}</p>
                            <p><strong>Nội dung:</strong> {session.exercisePlan}</p>
                            <button className="btn-edit" onClick={() => handleOpenEvaluation(session)}>
                                {session.evaluationScore !== null ? 'Sửa Đánh giá' : 'Thêm Đánh giá'}
                            </button>
                        </div>
                    )) : <p>Học viên này chưa có buổi tập nào đã "Hoàn thành" để đánh giá.</p>}
                 </div>
            </div>
        );
    }

    // --- Render the initial list of members ---
    return (
        <div className="management-page-container">
            <Link to="/dashboard">← Quay lại Dashboard</Link>
            <h2 style={{marginTop: '1rem'}}>Đánh giá Kết quả Luyện tập</h2>
            <h4>Vui lòng chọn một học viên:</h4>
            <div className="member-selection-list">
                {members.map(member => (
                    <button key={member.user_id} onClick={() => handleMemberSelect(member)} className="member-select-button">
                        {member.Profile.full_name}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default EvaluateWorkoutPage;