import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

const EquipmentStatusPage = () => {
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [newStatus, setNewStatus] = useState('operational');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { auth } = useContext(AuthContext);

  const fetchEquipment = useCallback(async () => {
    if (!auth || !auth.token) {
      if(isLoading) setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/equipment`, config);
      setEquipmentList(res.data);
    } catch (err) {
      setError('Failed to load equipment list.');
    } finally {
      setIsLoading(false);
    }
  }, [auth, isLoading]);

  useEffect(() => {
    fetchEquipment();
  }, [fetchEquipment]);

  const handleUpdateStatus = async (equipmentId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      const body = { status: newStatus };
      await axios.put(`${process.env.REACT_APP_API_URL}/equipment/${equipmentId}`, body, config);
      
      alert('Status updated successfully!');
      fetchEquipment(); // Refresh the list
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (isLoading) return <p>Loading equipment...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  return (
    <div>
      <h2>Update Equipment Status</h2>
      <table style={{width: '100%', borderCollapse: 'collapse'}}>
        <thead>
          <tr style={{backgroundColor: '#343a40', color: 'white'}}>
            <th style={{padding: '10px'}}>ID</th>
            <th style={{padding: '10px'}}>Name</th>
            <th style={{padding: '10px'}}>Current Status</th>
            <th style={{padding: '10px'}}>New Status</th>
            <th style={{padding: '10px'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.map(item => (
            <tr key={item.equipment_id}>
              <td style={{padding: '10px', border: '1px solid #ddd'}}>{item.equipment_id}</td>
              <td style={{padding: '10px', border: '1px solid #ddd'}}>{item.equipment_name}</td>
              <td style={{padding: '10px', border: '1px solid #ddd'}}>
                <span style={{fontWeight: 'bold', color: item.status === 'operational' ? 'green' : 'red'}}>
                  {item.status}
                </span>
              </td>
              <td style={{padding: '10px', border: '1px solid #ddd'}}>
                <select 
                  defaultValue={item.status} 
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="operational">Operational</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="broken">Broken</option>
                </select>
              </td>
              <td style={{padding: '10px', border: '1px solid #ddd'}}>
                <button onClick={() => handleUpdateStatus(item.equipment_id)}>Update</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EquipmentStatusPage;