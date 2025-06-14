import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext'; // Assuming you have this for the token

const StaffRegisterMemberPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    phoneNumber: '',
    email: '', // Optional
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null); // Will hold the new member's details
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { auth } = useContext(AuthContext); // Get token from context

  const { fullName, dateOfBirth, phoneNumber, email } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess(null);

    // Basic validation
    if (!fullName || !phoneNumber) {
      setError('Full Name and Phone Number are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`, // Send the staff member's token
        },
      };

      const body = JSON.stringify(formData);
      
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/members/register`, body, config);
      
      // On success, store the returned member info to display it
      setSuccess(res.data);
      // Clear the form for the next registration
      setFormData({
        fullName: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
      });

    } catch (err) {
      setError(err.response?.data?.msg || 'An unexpected server error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If a member was just successfully registered, show their details
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

  // Otherwise, show the registration form
  return (
    <div>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h2 style={{marginTop: '1rem'}}>Đăng ký hội viên mới</h2>
      <p>Enter the new member's details below. A temporary password will be generated.</p>
      
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</p>}

      <form onSubmit={onSubmit}>
        <div>
          <label>Họ tên:</label>
          <input
            type="text"
            name="fullName"
            value={fullName}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="dateOfBirth"
            value={dateOfBirth}
            onChange={onChange}
          />
        </div>
        <div>
          <label>Số điện thoại:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={phoneNumber}
            onChange={onChange}
            required
          />
        </div>
        <div>
          <label>Email (tùy chọn):</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Registering...' : 'Đăng ký'}
        </button>
      </form>
    </div>
  );
};

export default StaffRegisterMemberPage;