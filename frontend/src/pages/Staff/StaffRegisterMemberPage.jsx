import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const StaffRegisterMemberPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '',
  });
  
  // State for the package selection
  const [packages, setPackages] = useState([]);
  const [initialPackageId, setInitialPackageId] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth  = useContext(AuthContext);

  // Fetch available packages when the component loads
  useEffect(() => {
    const fetchPackages = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/packages`);
            setPackages(res.data);
            if (res.data.length > 0) {
                setInitialPackageId(res.data[0].package_id); // Default to the first package
            }
        } catch (err) {
            setError('Could not load packages. Please refresh the page.');
        }
    };
    fetchPackages();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(null);

    if (!formData.fullName || !formData.phoneNumber || !initialPackageId) {
      setError('Full Name, Phone Number, and Initial Package are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      };

      // Combine form data and selected package ID into one body
      const body = JSON.stringify({ ...formData, initialPackageId: Number(initialPackageId) });
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/members/register`, body, config);
      
      setSuccess(res.data);
      setFormData({ fullName: '', dateOfBirth: '', phoneNumber: '', email: '' });

    } catch (err) {
      setError(err.response?.data?.msg || 'An unexpected server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ padding: '20px', border: '1px solid green', borderRadius: '8px' }}>
        <h2>✅ {success.msg}</h2>
        <p>Please provide the following login credentials to the new member.</p>
        <div style={{ background: '#f0f0f0', padding: '15px', marginTop: '10px' }}>
          <p><strong>Full Name:</strong> {success.member.fullName}</p>
          <p><strong>Login Email/Username:</strong> {success.member.loginUsername}</p>
          <p><strong>Temporary Password:</strong> <strong style={{color: 'blue', fontSize: '1.2rem'}}>{success.member.temporaryPassword}</strong></p>
        </div>
        <button onClick={() => setSuccess(null)} style={{marginTop: '20px'}}>
          Register Another Member
        </button>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h2 style={{marginTop: '1rem'}}>Đăng ký hội viên mới</h2>
      
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</p>}

      <form onSubmit={onSubmit}>
        {/* Member details inputs ... */}
        <div><label>Họ tên:</label><input type="text" name="fullName" value={formData.fullName} onChange={onChange} required /></div>
        <div><label>Ngày sinh:</label><input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={onChange} /></div>
        <div><label>Số điện thoại:</label><input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={onChange} required /></div>
        <div><label>Email (tùy chọn):</label><input type="email" name="email" value={formData.email} onChange={onChange} /></div>

        <hr style={{margin: '2rem 0'}}/>

        {/* Package selection dropdown */}
        <h4>Chọn gói tập ban đầu</h4>
        <div>
          <label>Initial Package:</label>
          <select value={initialPackageId} onChange={(e) => setInitialPackageId(e.target.value)} required>
             {packages.map(pkg => (
                 <option key={pkg.package_id} value={pkg.package_id}>
                     {pkg.package_name} - {Number(pkg.price).toLocaleString()} VND
                 </option>
             ))}
          </select>
        </div>
        
        <button type="submit" disabled={isSubmitting} style={{marginTop: '1rem'}}>
          {isSubmitting ? 'Registering...' : 'Register and Activate Package'}
        </button>
      </form>
    </div>
  );
};

export default StaffRegisterMemberPage;