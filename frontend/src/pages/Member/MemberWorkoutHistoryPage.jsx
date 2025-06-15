import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const MemberWorkoutHistoryPage = () => {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const  auth  = useContext(AuthContext);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!auth || !auth.token) {
                setIsLoading(false);
                setError("Vui lòng đăng nhập để xem lịch sử.");
                return;
            }

            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/members/my-workout-history`, config);
                setSessions(res.data);
            } catch (err) {
                setError('Không thể tải lịch sử tập luyện.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [auth]);

    if (isLoading) return <p>Đang tải lịch sử...</p>;
    if (error) return <p style={{color: 'red'}}>{error}</p>;

    return (
        <div className="management-page-container">
            <Link to="/dashboard" className="btn-back-dashboard">← Quay lại Dashboard</Link>
            <h2 style={{marginTop: '1rem'}}>Lịch sử Tập luyện</h2>

            <div className="session-list">
                {sessions.length > 0 ? sessions.map(session => (
                    <div key={session.session_id} className="session-item">
                        <div className="session-header">
                            <strong>{new Date(session.sessionDatetime).toLocaleDateString('vi-VN')}</strong>
                            <span className={`status-badge status-${session.status.toLowerCase()}`}>{session.status}</span>
                        </div>
                        <div className="session-body">
                            <p><strong>Buổi tập:</strong> {session.exercisePlan}</p>
                            <p><strong>Thời lượng:</strong> {session.durationMinutes} phút</p>
                            <p><strong>Huấn luyện viên:</strong> {session.Trainer?.Profile?.full_name || 'N/A'}</p>
                            {session.trainerNotes && <p><strong>Ghi chú của HLV:</strong> {session.trainerNotes}</p>}
                            {session.evaluationScore !== null && (
                                <div className="evaluation-summary">
                                    <strong>Đánh giá:</strong> {session.evaluationScore}/10 - {session.evaluationComments}
                                </div>
                            )}
                        </div>
                    </div>
                )) : (
                    <p>Bạn chưa có buổi tập nào trong lịch sử.</p>
                )}
            </div>
        </div>
    );
};

export default MemberWorkoutHistoryPage;