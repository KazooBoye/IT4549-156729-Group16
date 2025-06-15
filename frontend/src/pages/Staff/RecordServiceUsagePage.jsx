import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const RecordServiceUsagePage = () => {
  const [services, setServices] = useState([]); // State for the services dropdown
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [duration, setDuration] = useState(60);
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Still need the token for the POST request
  const auth = useContext(AuthContext);

  // This useEffect now runs once on mount to fetch the public list of services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        // This is now a public API call, no token needed
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/services`);
        setServices(res.data);
        // If services are loaded, set the default selection
        if (res.data.length > 0) {
          setSelectedServiceId(res.data[0].service_id);
        }
      } catch (err) {
        setError("Không thể tải danh sách dịch vụ.");
        console.error("Fetch services error:", err);
      }
    };
    fetchServices();
  }, []); // Empty dependency array `[]` makes it run only once.

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Check for token before making the protected POST request
    if (!auth || !auth.token) {
        setError("Lỗi xác thực. Vui lòng đăng nhập lại.");
        setIsSubmitting(false);
        return;
    }

    if (!selectedMemberId || !selectedServiceId) {
      setError('Vui lòng chọn hội viên và loại dịch vụ.');
      setIsSubmitting(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const body = {
        memberId: Number(selectedMemberId),
        serviceDate: new Date().toISOString(),
        serviceId: Number(selectedServiceId),
        durationMinutes: Number(duration),
        notes,
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/service-history`, body, config);
      setSuccess(res.data.msg);
      setSelectedMemberId('');
      setNotes('');
    } catch (err) {
      setError(err.response?.data?.msg || 'Ghi nhận thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard">← Quay lại Dashboard</Link>
      <h2 style={{ marginTop: '1rem' }}>Ghi nhận Lịch sử Dịch vụ</h2>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>ID Hội viên:</label>
          <input
            type="number"
            placeholder="Nhập ID của hội viên..."
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Loại Dịch vụ:</label>
          <select value={selectedServiceId} onChange={(e) => setSelectedServiceId(e.target.value)} required>
            <option value="" disabled>-- Chọn dịch vụ --</option>
            {services.map(service => (
                <option key={service.service_id} value={service.service_id}>
                    {service.service_name}
                </option>
            ))}
          </select>
        </div>
        <div>
          <label>Thời lượng (phút):</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <div>
          <label>Ghi chú (tùy chọn):</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang ghi nhận...' : 'Ghi nhận'}
        </button>
      </form>
    </div>
  );
};

export default RecordServiceUsagePage;