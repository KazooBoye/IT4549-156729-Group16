import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const SystemSettingsPage = () => {
    const [settings, setSettings] = useState({
        gym_name: '',
        address: '',
        contact_phone: '',
        contact_email: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const  auth  = useContext(AuthContext);

    useEffect(() => {
        const fetchSettings = async () => {
            if (!auth || !auth.token) return;
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/settings`, config);
                setSettings(res.data);
            } catch (err) {
                setError('Không thể tải thông tin cài đặt.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [auth]);

    const handleChange = (e) => {
        setSettings({
            ...settings,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSuccess('');
        setError('');
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.put(`${process.env.REACT_APP_API_URL}/settings`, settings, config);
            setSuccess(res.data.msg);
        } catch (err) {
            setError(err.response?.data?.msg || 'Cập nhật thất bại.');
        }
    };

    if (isLoading) return <p>Đang tải cài đặt hệ thống...</p>;

    return (
    <div className="management-page-container">
      <Link to="/dashboard" className="btn-back-dashboard">← Quay lại Dashboard</Link>
      <h2 style={{ marginTop: '1rem' }}>Quản lý Thông tin Hệ thống</h2>
      <p>Cập nhật các thông tin chung sẽ được hiển thị cho khách hàng và nhân viên.</p>

      <div className="form-card settings-form">
        <form onSubmit={handleSubmit}>
          
          {error && <p className="form-error">{error}</p>}
          {success && <p className="form-success">{success}</p>}

          <div className="form-group">
            <label htmlFor="gym_name">Tên phòng tập:</label>
            <input id="gym_name" type="text" name="gym_name" value={settings.gym_name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="address">Địa chỉ:</label>
            <input id="address" type="text" name="address" value={settings.address} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="contact_phone">Số điện thoại liên hệ:</label>
            <input id="contact_phone" type="tel" name="contact_phone" value={settings.contact_phone} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="contact_email">Email liên hệ:</label>
            <input id="contact_email" type="email" name="contact_email" value={settings.contact_email} onChange={handleChange} required />
          </div>
          
          {/* Example of how you would add a file upload for the logo later */}
          {/* 
          <div className="form-group">
              <label htmlFor="logo_url">Logo URL:</label>
              <input id="logo_url" type="text" name="logo_url" value={settings.logo_url} onChange={handleChange} />
              <small>Or upload a new logo (feature to be added).</small>
          </div>
          */}

          <button type="submit" className="btn-primary" style={{marginTop: '1rem'}}>Lưu thay đổi</button>
        </form>
      </div>
    </div>
  );
};

export default SystemSettingsPage;