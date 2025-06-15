// File: src/pages/Staff/EquipmentStatusPage.jsx
import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const EquipmentStatusPage = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { auth } = useContext(AuthContext);

// This useEffect hook will now handle everything.
useEffect(() => {
  const fetchEquipment = async () => {
    setIsLoading(true);
    setError('');

    // --- The Key Change is Here ---
    // Instead of using the `auth` state, we read the token directly from storage.
    const token = localStorage.getItem('token');

    // If there is no token in storage, the user is not logged in.
    if (!token) {
      setError('Bạn phải đăng nhập để xem trang này.'); // "You must be logged in to view this page."
      setIsLoading(false);
      return;
    }

    try {
      // We build the config object with the token we just retrieved.
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/equipment`, config);
      setEquipmentList(res.data);
    } catch (err) {
      // This will catch errors if the token is invalid/expired (e.g., a 401 error from the server)
      setError('Không thể tải danh sách thiết bị. Phiên đăng nhập có thể đã hết hạn.'); // "Could not load... Session may have expired."
      console.error("Fetch equipment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchEquipment();
}, []); // <-- The empty dependency array ensures this runs only ONCE on mount.


// The handleUpdateStatus function can also be simplified slightly
const handleUpdateStatus = async (equipmentId, newStatus) => {
    const token = localStorage.getItem('token'); // Get the token again for the update
    if (!token) {
      return alert('Authentication error. Please log in again.');
    }
    // ... rest of the function remains the same, using the `token` variable ...
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const body = { status: newStatus };
      await axios.put(`${process.env.REACT_APP_API_URL}/equipment/${equipmentId}`, body, config);
      
      alert('Cập nhật trạng thái thành công!');
      
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/equipment`, config); // Pass config here too
      setEquipmentList(res.data);

    } catch (err) {
      alert('Cập nhật thất bại.');
    }
};

  if (isLoading) return <p>Đang tải danh sách thiết bị...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div>
      <Link to="/dashboard">← Quay lại Dashboard</Link>
      <h2 style={{marginTop: '1rem'}}>Cập nhật Tình trạng Thiết bị</h2>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{backgroundColor: '#343a40', color: 'white'}}>
            <th style={{padding: '12px'}}>Tên Thiết bị</th>
            <th style={{padding: '12px'}}>Trạng thái Hiện tại</th>
            <th style={{padding: '12px'}}>Hành động (Chọn trạng thái mới)</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.length > 0 ? (
            equipmentList.map(item => (
              <tr key={item.equipment_id}>
                <td style={{padding: '12px', border: '1px solid #ddd'}}>{item.equipment_name}</td>
                <td style={{padding: '12px', border: '1px solid #ddd'}}>
                  <span style={{fontWeight: 'bold', color: item.status === 'operational' ? 'green' : (item.status === 'broken' ? 'red' : 'orange')}}>
                    {item.status}
                  </span>
                </td>
                <td style={{padding: '12px', border: '1px solid #ddd'}}>
                  <select 
                    // defaultValue không tự re-render, dùng value để control
                    value={item.status} 
                    onChange={(e) => handleUpdateStatus(item.equipment_id, e.target.value)}
                  >
                    <option value="operational">Hoạt động (Operational)</option>
                    <option value="under_maintenance">Đang bảo trì (Under Maintenance)</option>
                    <option value="broken">Bị hỏng (Broken)</option>
                  </select>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{textAlign: 'center', padding: '20px'}}>Không có thiết bị nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentStatusPage;