import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const mockServices = ['Gym', 'Yoga', 'Sauna'];

const StaffMemberServiceHistoryPage = () => {
  const [search, setSearch] = useState('');
  const [memberResults, setMemberResults] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState({
    date: '',
    service: '',
    duration: '',
    note: '',
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search members (real API)
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/service-history/members`, { params: { query: search } });
      setMemberResults(res.data.map(m => ({ id: m.user_id, code: m.member_code, name: m.full_name })));
    } catch (err) {
      setError('Không tìm thấy hội viên phù hợp.');
    } finally {
      setIsLoading(false);
    }
  };

  // Select member
  const handleSelect = (member) => {
    setSelectedMember(member);
    setForm({ date: '', service: '', duration: '', note: '' });
    setResult(null);
    setError('');
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setResult(null);
  };

  // Validate form
  const validate = () => {
    if (!form.date) return 'Ngày sử dụng là bắt buộc.';
    if (new Date(form.date) > new Date()) return 'Ngày sử dụng không lớn hơn ngày hiện tại.';
    if (!form.service) return 'Loại dịch vụ là bắt buộc.';
    if (!form.duration || isNaN(form.duration) || form.duration < 5 || form.duration > 300) return 'Thời lượng phải là số nguyên từ 5 đến 300.';
    if (form.note && form.note.length > 255) return 'Ghi chú tối đa 255 ký tự.';
    return '';
  };

  // Submit usage (real API)
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
      await axios.post(`${process.env.REACT_APP_API_URL}/service-history`, {
        memberId: selectedMember.id,
        date: form.date,
        service: form.service,
        duration: form.duration,
        note: form.note,
      });
      setResult('Ghi nhận thành công!');
    } catch (err) {
      setError('Ghi nhận thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Ghi nhận lịch sử sử dụng dịch vụ của hội viên</h2>
      {/* Step 1: Search member */}
      <form onSubmit={handleSearch} style={{ maxWidth: 400, margin: '0 auto', background: '#f9f9f9', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <label htmlFor="search" style={{ fontWeight: 500 }}>Nhập mã hoặc tên hội viên:</label>
        <input
          id="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '8px 0 16px 0' }}
          placeholder="HV00123 hoặc Nguyễn Văn A"
        />
        <button type="submit" disabled={isLoading} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {isLoading ? 'Đang tìm...' : 'Tìm hội viên'}
        </button>
      </form>
      {/* Step 2: Show member results */}
      {memberResults.length > 0 && !selectedMember && (
        <div style={{ marginTop: 24, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto' }}>
          <h4>Kết quả tìm kiếm:</h4>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {memberResults.map(m => (
              <li key={m.id} style={{ marginBottom: 8, padding: 8, border: '1px solid #ccc', borderRadius: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{m.code} - {m.name}</span>
                <button onClick={() => handleSelect(m)} style={{ padding: '4px 10px', background: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Chọn</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Step 3: Record service usage */}
      {selectedMember && (
        <form onSubmit={handleSubmit} style={{ marginTop: 32, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <h4>Ghi nhận sử dụng dịch vụ cho: {selectedMember.name} ({selectedMember.code})</h4>
          <label htmlFor="date" style={{ fontWeight: 500 }}>Ngày sử dụng:</label>
          <input
            id="date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            max={new Date().toISOString().slice(0, 10)}
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
          />
          <label htmlFor="service" style={{ fontWeight: 500 }}>Loại dịch vụ:</label>
          <select
            id="service"
            name="service"
            value={form.service}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
          >
            <option value="" disabled>-- Chọn dịch vụ --</option>
            {mockServices.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label htmlFor="duration" style={{ fontWeight: 500 }}>Thời lượng sử dụng (phút):</label>
          <input
            id="duration"
            name="duration"
            type="number"
            min={5}
            max={300}
            value={form.duration}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
          />
          <label htmlFor="note" style={{ fontWeight: 500 }}>Ghi chú (tùy chọn):</label>
          <textarea
            id="note"
            name="note"
            value={form.note}
            onChange={handleChange}
            maxLength={255}
            rows={3}
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
            placeholder="Ghi chú thêm nếu có"
          />
          <button type="submit" disabled={isSubmitting} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {isSubmitting ? 'Đang ghi nhận...' : 'Ghi nhận'}
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

export default StaffMemberServiceHistoryPage; 