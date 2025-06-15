import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
// You will need a modal component or create a simple one
// import Modal from '../../components/Common/Modal'; 

const UserManagementPage = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const  auth  = useContext(AuthContext);

    // State for managing add/edit form/modal
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // The user being edited
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'member',
        phoneNumber: ''
    });

    const fetchUsers = async () => {
        if (!auth || !auth.token) return;
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/users`, config);
            setUsers(res.data);
        } catch (err) {
            setError('Không thể tải danh sách người dùng.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [auth]);

    const handleOpenForm = (user = null) => {
        if (user) { // Editing existing user
            setIsEditing(true);
            setCurrentUser(user);
            setFormData({
                fullName: user.Profile?.full_name || '',
                email: user.email,
                role: user.role,
                phoneNumber: user.Profile?.phone_number || '',
                password: '', // Password fields are always cleared for security
                confirmPassword: ''
            });
        } else { // Adding new user
            setIsEditing(false);
            setCurrentUser(null);
            setFormData({ fullName: '', email: '', password: '', confirmPassword: '', role: 'member', phoneNumber: ''});
        }
        setIsFormVisible(true);
    };

    const handleFormChange = (e) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        if (!isEditing && formData.password !== formData.confirmPassword) {
            return alert("Passwords do not match!");
        }
        
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            if (isEditing) { // Update logic
                await axios.put(`${process.env.REACT_APP_API_URL}/users/${currentUser.user_id}`, formData, config);
                alert('User updated successfully!');
            } else { // Create logic
                await axios.post(`${process.env.REACT_APP_API_URL}/users`, formData, config);
                alert('User created successfully!');
            }
            setIsFormVisible(false);
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert(err.response?.data?.msg || 'An error occurred.');
        }
    };

    const handleResetPassword = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn đặt lại mật khẩu cho người dùng này? Mật khẩu mới sẽ được tạo ngẫu nhiên.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                // We send an empty object {} in the body for the PUT request
                const res = await axios.put(`${process.env.REACT_APP_API_URL}/users/${userId}/reset-password`, {}, config);
                
                // Show the new password to the owner so they can provide it to the user
                alert(`Đặt lại mật khẩu thành công! Mật khẩu mới là: ${res.data.newPassword}\n\nVui lòng cung cấp mật khẩu này cho người dùng.`);
            } catch (err) {
                alert('Đặt lại mật khẩu thất bại.');
                console.error("Password reset error:", err.response?.data?.msg || err);
            }
        }
    };

    const handleDeleteUser = async (userId) => {
        if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa vĩnh viễn người dùng này? Tất cả dữ liệu liên quan (hồ sơ, gói tập, lịch sử) cũng sẽ bị xóa.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                await axios.delete(`${process.env.REACT_APP_API_URL}/users/${userId}`, config);
                
                alert('Xóa người dùng thành công!');
                fetchUsers(); // Refresh the user list
            } catch (err) {
                alert('Xóa người dùng thất bại.');
                console.error("Delete user error:", err.response?.data?.msg || err);
            }
        }
    };


     if (isLoading) return <p>Đang tải...</p>;
  if (error) return <p style={{color: 'red'}}>{error}</p>;

  // This is the new, corrected render logic
  return (
    <div className="management-page-container">
      {/* The modal for adding/editing will be controlled by this state */}
      {isFormVisible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{isEditing ? 'Chỉnh sửa Người dùng' : 'Thêm Người dùng mới'}</h2>
            <form onSubmit={handleFormSubmit}>
              <div className="form-group">
                <label>Họ tên:</label>
                <input name="fullName" value={formData.fullName} onChange={handleFormChange} placeholder="Full Name" required />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input name="email" type="email" value={formData.email} onChange={handleFormChange} placeholder="Email" required />
              </div>
              <div className="form-group">
                <label>Số điện thoại (tùy chọn):</label>
                <input name="phoneNumber" type="tel" value={formData.phoneNumber} onChange={handleFormChange} placeholder="Phone Number" />
              </div>
              <div className="form-group">
                <label>Vai trò:</label>
                <select name="role" value={formData.role} onChange={handleFormChange}>
                  <option value="member">Member</option>
                  <option value="trainer">Trainer</option>
                  <option value="staff">Staff</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              {!isEditing && (
                <>
                  <div className="form-group">
                    <label>Mật khẩu:</label>
                    <input name="password" type="password" value={formData.password} onChange={handleFormChange} placeholder="Password" required />
                  </div>
                  <div className="form-group">
                    <label>Xác nhận Mật khẩu:</label>
                    <input name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleFormChange} placeholder="Confirm Password" required />
                  </div>
                </>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsFormVisible(false)}>Hủy bỏ</button>
                <button type="submit" className="btn-primary">{isEditing ? 'Cập nhật' : 'Tạo Người dùng'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <Link to="/dashboard" className="btn-back-dashboard">← Quay lại Dashboard</Link>
      <div className="page-header">
        <h2>Quản lý Người dùng Hệ thống</h2>
        <button className="btn-add-new" onClick={() => handleOpenForm()}>Thêm Người dùng mới</button>
      </div>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map(user => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  {/* FIX: Correctly access nested Profile data with optional chaining */}
                  <td>{user.Profile?.full_name || 'N/A'}</td>
                  <td>{user.email}</td>
                  <td>
                    {/* Use a styled badge for the role */}
                    <span className={`status-badge status-${user.role}`}>{user.role}</span>
                  </td>
                  <td className="action-buttons">
                    <button className="btn-edit" onClick={() => handleOpenForm(user)}>Sửa</button>
                    <button className="btn-action btn-missed" onClick={() => handleResetPassword(user.user_id)}>Reset Pass</button>
                    <button className="btn-delete" onClick={() => handleDeleteUser(user.user_id)}>Xóa</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data-cell">Không có người dùng nào trong hệ thống.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagementPage;