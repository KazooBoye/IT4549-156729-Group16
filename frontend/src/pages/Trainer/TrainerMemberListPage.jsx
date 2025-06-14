import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const mockPackages = [
  { id: 'pkg1', name: 'Gym 3 tháng' },
  { id: 'pkg2', name: 'Yoga 1 tháng' },
  { id: 'pkg3', name: 'PT 6 tháng' },
];
const statusOptions = ['Đang tập', 'Tạm ngưng', 'Kết thúc'];

const TrainerMemberListPage = () => {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState(''); // 'add' | 'edit'
  const [form, setForm] = useState({
    email: '',
    name: '',
    package: '',
    startDate: '',
    status: '',
  });
  const [error, setError] = useState('');
  const [result, setResult] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch members (mocked)
  useEffect(() => {
    // Replace with real API call
    setMembers([
      { id: 1, email: 'hv00234@gmail.com', name: 'Đỗ Tuấn Minh', package: 'Gym 3 tháng', startDate: '2024-06-04', status: 'Đang tập' },
      { id: 2, email: 'hv00345@gmail.com', name: 'Nguyễn Thị Lan', package: 'Yoga 1 tháng', startDate: '2024-06-01', status: 'Tạm ngưng' },
    ]);
  }, []);

  // Show add/edit form
  const openForm = (type, member = null) => {
    setFormType(type);
    setShowForm(true);
    setError('');
    setResult('');
    if (type === 'edit' && member) {
      setSelectedMember(member);
      setForm({
        email: member.email,
        name: member.name,
        package: member.package,
        startDate: member.startDate,
        status: member.status,
      });
    } else {
      setSelectedMember(null);
      setForm({ email: '', name: '', package: '', startDate: '', status: '' });
    }
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setResult('');
  };

  // Validate form
  const validate = () => {
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) return 'Email hợp lệ là bắt buộc.';
    if (!form.name || /[^a-zA-ZÀ-ỹ\s]/.test(form.name) || form.name.length > 50) return 'Tên không chứa ký tự đặc biệt, tối đa 50 ký tự.';
    if (!form.package) return 'Gói tập là bắt buộc.';
    if (!form.startDate || new Date(form.startDate) > new Date()) return 'Ngày bắt đầu hợp lệ là bắt buộc.';
    if (!form.status) return 'Trạng thái là bắt buộc.';
    return '';
  };

  // Submit add/edit
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setResult('');
    const errMsg = validate();
    if (errMsg) {
      setError(errMsg);
      return;
    }
    if (formType === 'add') {
      // Replace with real API call
      setMembers(prev => [...prev, { id: Date.now(), ...form }]);
      setResult('Thêm học viên thành công!');
    } else if (formType === 'edit' && selectedMember) {
      // Replace with real API call
      setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, ...form } : m));
      setResult('Cập nhật học viên thành công!');
    }
    setShowForm(false);
  };

  // Delete member
  const handleDelete = (member) => {
    setSelectedMember(member);
    setConfirmDelete(true);
    setResult('');
    setError('');
  };
  const confirmDeleteMember = () => {
    // Replace with real API call
    setMembers(prev => prev.filter(m => m.id !== selectedMember.id));
    setResult('Xóa học viên thành công!');
    setConfirmDelete(false);
    setSelectedMember(null);
  };

  // View details
  const handleView = (member) => {
    setSelectedMember(member);
    setShowForm(false);
    setResult('');
    setError('');
  };

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Quản lý danh sách học viên</h2>
      <button onClick={() => openForm('add')} style={{ marginBottom: 16, padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Thêm học viên</button>
      <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff' }}>
        <thead>
          <tr style={{ background: '#e3e3e3' }}>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Email</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Tên học viên</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Gói tập</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Ngày bắt đầu</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Trạng thái</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {members.map(m => (
            <tr key={m.id} style={{ background: selectedMember && selectedMember.id === m.id ? '#d0ebff' : undefined }}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.email}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.name}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.package}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.startDate}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{m.status}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <button onClick={() => handleView(m)} style={{ marginRight: 8, padding: '4px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Xem</button>
                <button onClick={() => openForm('edit', m)} style={{ marginRight: 8, padding: '4px 10px', background: '#ffc107', color: 'black', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Sửa</button>
                <button onClick={() => handleDelete(m)} style={{ padding: '4px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add/Edit Form */}
      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginTop: 32, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <h4>{formType === 'add' ? 'Thêm học viên' : 'Chỉnh sửa học viên'}</h4>
          <label htmlFor="email" style={{ fontWeight: 500 }}>Email:</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
            placeholder="hv00234@gmail.com"
          />
          <label htmlFor="name" style={{ fontWeight: 500 }}>Họ tên học viên:</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
            placeholder="Đỗ Tuấn Minh"
          />
          <label htmlFor="package" style={{ fontWeight: 500 }}>Gói tập:</label>
          <select
            id="package"
            name="package"
            value={form.package}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
          >
            <option value="" disabled>-- Chọn gói tập --</option>
            {mockPackages.map(pkg => (
              <option key={pkg.id} value={pkg.name}>{pkg.name}</option>
            ))}
          </select>
          <label htmlFor="startDate" style={{ fontWeight: 500 }}>Ngày bắt đầu:</label>
          <input
            id="startDate"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
            max={new Date().toISOString().slice(0, 10)}
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
          />
          <label htmlFor="status" style={{ fontWeight: 500 }}>Trạng thái:</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: 8, marginTop: 4, marginBottom: 16 }}
          >
            <option value="" disabled>-- Chọn trạng thái --</option>
            {statusOptions.map(st => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {formType === 'add' ? 'Thêm' : 'Cập nhật'}
          </button>
          {error && <div style={{ marginTop: 16, color: 'red', fontWeight: 500 }}>{error}</div>}
          {result && <div style={{ marginTop: 16, color: 'green', fontWeight: 500 }}>{result}</div>}
        </form>
      )}
      {/* View details */}
      {selectedMember && !showForm && (
        <div style={{ marginTop: 32, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto', background: '#f9f9f9', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee' }}>
          <h4>Chi tiết học viên</h4>
          <div><strong>Email:</strong> {selectedMember.email}</div>
          <div><strong>Họ tên:</strong> {selectedMember.name}</div>
          <div><strong>Gói tập:</strong> {selectedMember.package}</div>
          <div><strong>Ngày bắt đầu:</strong> {selectedMember.startDate}</div>
          <div><strong>Trạng thái:</strong> {selectedMember.status}</div>
          <button onClick={() => setSelectedMember(null)} style={{ marginTop: 16, padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Đóng</button>
        </div>
      )}
      {/* Confirm delete */}
      {confirmDelete && (
        <div style={{ marginTop: 32, maxWidth: 400, marginLeft: 'auto', marginRight: 'auto', background: '#fff3cd', padding: 24, borderRadius: 8, boxShadow: '0 2px 8px #eee', color: '#856404' }}>
          <h4>Xác nhận xóa học viên</h4>
          <div>Bạn có chắc chắn muốn xóa học viên <strong>{selectedMember?.name}</strong> không?</div>
          <button onClick={confirmDeleteMember} style={{ marginTop: 16, marginRight: 8, padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Xóa</button>
          <button onClick={() => setConfirmDelete(false)} style={{ marginTop: 16, padding: '8px 16px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Hủy</button>
        </div>
      )}
    </div>
  );
};

export default TrainerMemberListPage; 