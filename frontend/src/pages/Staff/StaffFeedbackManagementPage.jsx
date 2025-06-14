import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusOptions = [
  'Đã phản hồi',
  'Đã chuyển tiếp',
  'Đã giải quyết',
];

const StaffFeedbackManagementPage = () => {
  const [feedbackList, setFeedbackList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [response, setResponse] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch feedback list on mount
  useEffect(() => {
    const fetchFeedback = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/feedback`);
        setFeedbackList(res.data.map(fb => ({
          id: fb.feedback_id,
          memberCode: fb.member_code,
          memberName: fb.full_name,
          time: fb.created_at,
          title: fb.feedback_type,
          content: fb.comments,
          status: fb.status,
          response: fb.resolution_notes || '',
          responseStatus: fb.status,
        })));
      } catch (err) {
        setError('Không thể tải danh sách phản hồi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, []);

  // Select feedback
  const handleSelect = (id) => {
    setSelectedId(id);
    setResult(null);
    setError('');
    const fb = feedbackList.find(f => f.id === id);
    setSelectedFeedback(fb);
    setResponse(fb?.response || '');
    setNewStatus(fb?.responseStatus || '');
  };

  // Submit response
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!selectedFeedback) {
      setError('Vui lòng chọn một phản hồi để xử lý.');
      return;
    }
    if (!response.trim() || response.length < 10) {
      setError('Nội dung phản hồi không được để trống và phải từ 10 ký tự.');
      return;
    }
    if (!newStatus) {
      setError('Vui lòng chọn trạng thái xử lý.');
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/feedback/${selectedFeedback.id}`, {
        status: newStatus,
        resolution_notes: response,
      });
      setResult('Phản hồi đã được cập nhật!');
      setFeedbackList(list => list.map(f => f.id === selectedFeedback.id ? { ...f, response, responseStatus: newStatus, status: newStatus } : f));
    } catch (err) {
      setError('Cập nhật phản hồi thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Xử lý phản hồi từ hội viên</h2>
      {/* Feedback list */}
      <div style={{ marginBottom: 32 }}>
        <h4>Danh sách phản hồi</h4>
        {isLoading ? <p>Đang tải...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#e3e3e3' }}>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Mã hội viên</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Tên hội viên</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Thời gian gửi</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Tiêu đề</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Trạng thái</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Chọn</th>
              </tr>
            </thead>
            <tbody>
              {feedbackList.map(fb => (
                <tr key={fb.id} style={{ background: selectedId === fb.id ? '#d0ebff' : undefined }}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.memberCode}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.memberName}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.time}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.title}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{fb.status}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>
                    <button onClick={() => handleSelect(fb.id)} style={{ padding: '4px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Chọn</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* Feedback detail and response */}
      {selectedFeedback && (
        <form onSubmit={handleSubmit} style={{ maxWidth: 600, margin: '0 auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <h4>Chi tiết phản hồi</h4>
          <div><strong>Mã hội viên:</strong> {selectedFeedback.memberCode}</div>
          <div><strong>Tiêu đề:</strong> {selectedFeedback.title}</div>
          <div><strong>Nội dung:</strong> {selectedFeedback.content}</div>
          <div><strong>Thời gian gửi:</strong> {selectedFeedback.time}</div>
          <label htmlFor="response" style={{ fontWeight: 500, marginTop: 16, display: 'block' }}>Nội dung xử lý:</label>
          <textarea
            id="response"
            value={response}
            onChange={e => setResponse(e.target.value)}
            rows={4}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Nhập nội dung xử lý..."
            required
          />
          <label htmlFor="status" style={{ fontWeight: 500, marginTop: 16, display: 'block' }}>Trạng thái xử lý:</label>
          <select id="status" value={newStatus} onChange={e => setNewStatus(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
            <option value="" disabled>-- Chọn trạng thái --</option>
            {statusOptions.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <button type="submit" disabled={isSubmitting} style={{ marginTop: 16, padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật phản hồi'}
          </button>
        </form>
      )}
      {error && (
        <div style={{ marginTop: 24, color: 'red', fontWeight: 500, textAlign: 'center' }}>{error}</div>
      )}
      {result && (
        <div style={{ marginTop: 24, color: 'green', fontWeight: 500, textAlign: 'center' }}>{result}</div>
      )}
    </div>
  );
};

export default StaffFeedbackManagementPage; 