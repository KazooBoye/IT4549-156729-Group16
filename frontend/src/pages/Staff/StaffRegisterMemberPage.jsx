import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const StaffRegisterMemberPage = () => {
  const [form, setForm] = useState({
    fullName: '',
    dob: '',
    phone: '',
    email: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    if (!form.fullName.trim()) return 'Họ tên là bắt buộc.';
    if (/[^a-zA-ZÀ-ỹ\s]/.test(form.fullName)) return 'Họ tên không chứa ký tự đặc biệt.';
    if (!form.dob) return 'Ngày sinh là bắt buộc.';
    if (isNaN(Date.parse(form.dob)) || new Date(form.dob) > new Date()) return 'Ngày sinh không hợp lệ.';
    if (!/^\d{10}$/.test(form.phone)) return 'Số điện thoại phải đúng định dạng 10 số.';
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) return 'Email không hợp lệ.';
    return '';
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/members/register`, form);
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Đăng ký thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Đăng ký hội viên mới</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '0 auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="fullName" style={{ fontWeight: 500 }}>Họ tên:</label>
          <input
            id="fullName"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="Nguyễn Văn B"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="dob" style={{ fontWeight: 500 }}>Ngày sinh:</label>
          <input
            id="dob"
            name="dob"
            type="date"
            value={form.dob}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="phone" style={{ fontWeight: 500 }}>Số điện thoại:</label>
          <input
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="0912345678"
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" style={{ fontWeight: 500 }}>Email (tùy chọn):</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{ width: '100%', padding: 8, marginTop: 4 }}
            placeholder="abc@gmail.com"
          />
        </div>
        <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>
      {error && (
        <div style={{ marginTop: 24, color: 'red', fontWeight: 500, textAlign: 'center' }}>{error}</div>
      )}
      {result && (
        <div style={{ marginTop: 24, color: 'green', fontWeight: 500, textAlign: 'center' }}>
          <div>Đăng ký thành công!</div>
          <div><strong>Mã hội viên:</strong> {result.memberCode}</div>
          <div><strong>Tài khoản đăng nhập:</strong> {result.username} / {result.password}</div>
        </div>
      )}
    </div>
  );
};

export default StaffRegisterMemberPage; 