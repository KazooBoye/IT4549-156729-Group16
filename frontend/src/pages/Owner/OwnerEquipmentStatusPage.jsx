import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const statusOptions = [
  'Hoạt động tốt',
  'Hỏng',
  'Đang sửa',
  'Bảo trì',
];

const OwnerEquipmentStatusPage = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [note, setNote] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch equipment list on mount
  useEffect(() => {
    const fetchEquipment = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/equipment`);
        setEquipmentList(res.data);
      } catch (err) {
        setError('Không thể tải danh sách thiết bị.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchEquipment();
  }, []);

  const handleSelect = (e) => {
    setSelectedId(e.target.value);
    setNewStatus('');
    setNote('');
    setResult(null);
    setError('');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!selectedId || !newStatus) {
      setError('Vui lòng chọn thiết bị và trạng thái mới.');
      return;
    }
    if (note.length > 200) {
      setError('Ghi chú không được vượt quá 200 ký tự.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.put(`${process.env.REACT_APP_API_URL}/equipment/${selectedId}`, {
        status: newStatus,
        note,
      });
      setResult({
        message: res.data.message,
        time: new Date().toLocaleString('sv-SE', { hour12: false }).replace(' ', 'T'),
      });
      // Update equipment list in UI
      setEquipmentList((prev) =>
        prev.map(eq => eq.equipment_id === parseInt(selectedId)
          ? { ...eq, status: newStatus, note }
          : eq)
      );
    } catch (err) {
      setError(err.response?.data?.error || 'Cập nhật thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Cập nhật thông tin tình trạng thiết bị</h2>
      <form onSubmit={handleUpdate} style={{ maxWidth: 500, margin: '0 auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="equipment" style={{ fontWeight: 500 }}>Chọn thiết bị:</label>
          <select id="equipment" value={selectedId} onChange={handleSelect} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
            <option value="" disabled>-- Chọn thiết bị --</option>
            {equipmentList.map(eq => (
              <option key={eq.equipment_id} value={eq.equipment_id}>{eq.equipment_name} ({eq.equipment_id}) - {eq.status}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="status" style={{ fontWeight: 500 }}>Trạng thái mới:</label>
          <select id="status" value={newStatus} onChange={e => setNewStatus(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
            <option value="" disabled>-- Chọn trạng thái --</option>
            {statusOptions.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="note" style={{ fontWeight: 500 }}>Ghi chú (tùy chọn):</label>
          <textarea
            id="note"
            value={note}
            onChange={e => setNote(e.target.value)}
            maxLength={200}
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Tối đa 200 ký tự"
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </form>
      {error && (
        <div style={{ marginTop: 24, color: 'red', fontWeight: 500, textAlign: 'center' }}>{error}</div>
      )}
      {result && (
        <div style={{ marginTop: 24, color: 'green', fontWeight: 500, textAlign: 'center' }}>
          {result.message}!<br />
          <span>Thời gian cập nhật: {result.time.replace('T', ' ')}</span>
        </div>
      )}
      {/* Equipment status table */}
      <div style={{ marginTop: 40 }}>
        <h3>Danh sách thiết bị và trạng thái hiện tại</h3>
        {isLoading ? (
          <p>Đang tải danh sách thiết bị...</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
            <thead>
              <tr style={{ background: '#e3e3e3' }}>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>ID Thiết bị</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Tên thiết bị</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Trạng thái hiện tại</th>
                <th style={{ border: '1px solid #ccc', padding: 8 }}>Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {equipmentList.map(eq => (
                <tr key={eq.equipment_id}>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{eq.equipment_id}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{eq.equipment_name}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{eq.status}</td>
                  <td style={{ border: '1px solid #ccc', padding: 8 }}>{eq.note || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default OwnerEquipmentStatusPage; 