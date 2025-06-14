import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const mockPackages = [
  { id: 'pkg1', name: 'Gói cơ bản 1 tháng', duration: 1, sessions: 12 },
  { id: 'pkg2', name: 'Gói nâng cao 3 tháng', duration: 3, sessions: 36 },
  { id: 'pkg3', name: 'Gói VIP 12 tháng', duration: 12, sessions: 144 },
];

const StaffRenewPackagePage = () => {
  const [memberCode, setMemberCode] = useState('');
  const [memberInfo, setMemberInfo] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [renewMonths, setRenewMonths] = useState(1);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Search member
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setMemberInfo(null);
    setIsLoading(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/members/by-code/${memberCode}`);
      setMemberInfo(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Không tìm thấy hội viên.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Renew package
  const handleRenew = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/members/renew-package`, {
        memberCode,
        packageId: selectedPackage,
        months: renewMonths,
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Gia hạn thất bại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Gia hạn gói tập cho hội viên</h2>
      {/* Step 1: Search member */}
      <form onSubmit={handleSearch} style={{ maxWidth: 400, margin: '0 auto', background: '#f9f9f9', padding: 20, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
        <label htmlFor="memberCode" style={{ fontWeight: 500 }}>Nhập mã hội viên:</label>
        <input
          id="memberCode"
          value={memberCode}
          onChange={e => setMemberCode(e.target.value)}
          required
          style={{ width: '100%', padding: 8, margin: '8px 0 16px 0' }}
          placeholder="HV123"
        />
        <button type="submit" disabled={isLoading} style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
          {isLoading ? 'Đang tìm...' : 'Tìm hội viên'}
        </button>
      </form>
      {/* Step 2: Show member info and renew form */}
      {memberInfo && (
        <div style={{ marginTop: 32, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <h4>Thông tin hội viên</h4>
          <div><strong>Họ tên:</strong> {memberInfo.fullName}</div>
          <div><strong>Gói tập hiện tại:</strong> {memberInfo.currentPackageName}</div>
          <div><strong>Ngày hết hạn:</strong> {memberInfo.currentPackageEndDate}</div>
          <form onSubmit={handleRenew} style={{ marginTop: 24 }}>
            <label htmlFor="package" style={{ fontWeight: 500 }}>Chọn gói gia hạn:</label>
            <select id="package" value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)} required style={{ width: '100%', padding: 8, marginTop: 4 }}>
              <option value="" disabled>-- Chọn gói --</option>
              {mockPackages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
              ))}
            </select>
            <label htmlFor="months" style={{ fontWeight: 500, marginTop: 16, display: 'block' }}>Số tháng gia hạn:</label>
            <input
              id="months"
              type="number"
              min={1}
              max={12}
              value={renewMonths}
              onChange={e => setRenewMonths(Number(e.target.value))}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
            <button type="submit" disabled={isSubmitting} style={{ marginTop: 16, padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
              {isSubmitting ? 'Đang gia hạn...' : 'Gia hạn'}
            </button>
          </form>
        </div>
      )}
      {/* Result */}
      {error && (
        <div style={{ marginTop: 24, color: 'red', fontWeight: 500, textAlign: 'center' }}>{error}</div>
      )}
      {result && (
        <div style={{ marginTop: 32, color: 'green', fontWeight: 500, textAlign: 'center', background: '#f0fff0', padding: 20, borderRadius: 8 }}>
          <div>Gia hạn thành công!</div>
          <div><strong>Thời gian bắt đầu:</strong> {result.startDate}</div>
          <div><strong>Thời gian kết thúc:</strong> {result.endDate}</div>
          <div><strong>Số buổi còn lại:</strong> {result.remainingSessions}</div>
          <div><strong>Trạng thái gói tập:</strong> {result.packageStatus}</div>
          <div><strong>Ngày thanh toán:</strong> {result.paymentDate}</div>
        </div>
      )}
    </div>
  );
};

export default StaffRenewPackagePage; 