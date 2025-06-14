import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

// Mock trainers data
const mockTrainers = [
  { id: 'HLV001', name: 'Nguyễn Văn A' },
  { id: 'HLV002', name: 'Trần Thị B' },
  { id: 'HLV003', name: 'Lê Văn C' },
];

const MemberBookingPage = () => {
  const { user } = useContext(AuthContext);
  const [selectedTrainer, setSelectedTrainer] = useState('');
  const [desiredTime, setDesiredTime] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simulate booking logic
  const handleBooking = (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);
    // Simulate API delay and logic
    setTimeout(() => {
      // Mock: Trainer HLV001 is unavailable at 2025-04-07T10:00
      if (selectedTrainer === 'HLV001' && desiredTime === '2025-04-07T10:00') {
        setError('Huấn luyện viên không khả dụng tại thời điểm này.');
        setIsSubmitting(false);
      } else {
        setResult({
          status: 'success',
          time: desiredTime,
          trainer: mockTrainers.find(t => t.id === selectedTrainer)?.name || '',
        });
        setIsSubmitting(false);
      }
    }, 1200);
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Đặt lịch tập với huấn luyện viên cá nhân</h2>
      <form onSubmit={handleBooking} style={{ maxWidth: 500, margin: '0 auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="trainer" style={{ fontWeight: 500 }}>Chọn huấn luyện viên:</label>
          <select id="trainer" value={selectedTrainer} onChange={e => setSelectedTrainer(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
            <option value="" disabled>-- Chọn huấn luyện viên --</option>
            {mockTrainers.map(trainer => (
              <option key={trainer.id} value={trainer.id}>{trainer.name} ({trainer.id})</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="datetime" style={{ fontWeight: 500 }}>Chọn thời gian mong muốn:</label>
          <input
            id="datetime"
            type="datetime-local"
            value={desiredTime}
            onChange={e => setDesiredTime(e.target.value)}
            required
            min={new Date().toISOString().slice(0, 16)}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {isSubmitting ? 'Đang xử lý...' : 'Đặt lịch'}
        </button>
      </form>
      {error && (
        <div style={{ marginTop: 24, color: 'red', fontWeight: 500, textAlign: 'center' }}>{error}</div>
      )}
      {result && (
        <div style={{ marginTop: 24, color: 'green', fontWeight: 500, textAlign: 'center' }}>
          Đặt lịch thành công!<br />
          <span>Thời gian: {result.time.replace('T', ' ')}</span><br />
          <span>Huấn luyện viên: {result.trainer}</span>
        </div>
      )}
    </div>
  );
};

export default MemberBookingPage; 