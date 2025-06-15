import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const TrainerMemberManagementPage = () => {
    // --- State for main list ---
    const [members, setMembers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const  auth  = useContext(AuthContext);

    // --- State for managing views and forms ---
    const [view, setView] = useState('list');
    const [selectedMember, setSelectedMember] = useState(null);
    const [editFormData, setEditFormData] = useState({});

    // --- State for the "Assign Member" modal ---
    const [isAssignModalVisible, setIsAssignModalVisible] = useState(false);
    const [unassignedMembers, setUnassignedMembers] = useState([]);
    const [isLoadingModal, setIsLoadingModal] = useState(false);

    // --- Data Fetching and Event Handlers ---

    const fetchAssignedMembers = async () => {
        if (!auth || !auth.token) {
            setIsLoading(false);
            setError('Could not verify authentication. Please log in again.');
            return;
        }
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/members`, config);
            setMembers(res.data);
        } catch (err) {
            setError('Không thể tải danh sách hội viên.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (auth?.token) {
            fetchAssignedMembers();
        }
    }, [auth]);

    const handleViewDetails = async (memberId) => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/trainer/member/${memberId}`, config);
            setSelectedMember(res.data);
            setView('details');
        } catch (err) {
            alert('Không thể tải chi tiết hội viên.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleEditClick = (member) => {
        setSelectedMember(member);
        setEditFormData({
            fullName: member.Profile.full_name,
            phoneNumber: member.Profile.phone_number,
            dateOfBirth: member.Profile.date_of_birth ? new Date(member.Profile.date_of_birth).toISOString().split('T')[0] : ''
        });
        setView('edit');
    };

    const handleEditFormChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            await axios.put(`${process.env.REACT_APP_API_URL}/trainer/member/${selectedMember.user_id}`, editFormData, config);
            alert('Cập nhật thành công!');
            setView('list');
            fetchAssignedMembers();
        } catch(err) {
            alert('Cập nhật thất bại.');
        }
    };

    const handleDelete = async (memberId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa hội viên này? Hành động này không thể hoàn tác.')) {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                await axios.delete(`${process.env.REACT_APP_API_URL}/trainer/member/${memberId}`, config);
                alert('Xóa thành công!');
                fetchAssignedMembers();
            } catch (err) {
                alert('Xóa thất bại.');
            }
        }
    };

    const handleOpenAssignModal = async () => {
        setIsAssignModalVisible(true);
        setIsLoadingModal(true);
        try {
            const config = { headers: { Authorization: `Bearer ${auth.token}` } };
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/unassigned-members`, config);
            setUnassignedMembers(res.data);
        } catch (err) {
            alert('Could not load list of available members.');
        } finally {
            setIsLoadingModal(false);
        }
    };
    
    const handleAssignMember = async (memberToAssign) => {
        if (window.confirm(`Bạn có chắc muốn phân công học viên "${memberToAssign.Profile.full_name}" cho mình?`)) {
            try {
                const config = { headers: { Authorization: `Bearer ${auth.token}` } };
                const bookingData = {
                    trainer_user_id: auth.user.user_id,
                    member_user_id: memberToAssign.user_id,
                    session_datetime: new Date().toISOString(), 
                    notes_member: 'Initial assignment by trainer.'
                };
                await axios.post(`${process.env.REACT_APP_API_URL}/bookings`, bookingData, config);
                
                alert('Phân công thành công!');
                setIsAssignModalVisible(false);
                fetchAssignedMembers();
            } catch (err) {
                alert('Phân công thất bại.');
            }
        }
    };

    // --- RENDER LOGIC ---

    if (isLoading) return <p>Đang tải...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    const AssignMemberModal = (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Phân công Học viên có sẵn</h2>
                <div className="search-results">
                    {isLoadingModal ? <p>Đang tải danh sách...</p> : 
                     unassignedMembers.length > 0 ? unassignedMembers.map(user => (
                        <div key={user.user_id} className="search-result-item">
                            <span>{user.Profile.full_name} ({user.email})</span>
                            <button onClick={() => handleAssignMember(user)}>Phân công</button>
                        </div>
                    )) : <p>Không có học viên nào chưa được phân công.</p>}
                </div>
                <button type="button" className="btn-secondary" style={{marginTop: '1rem'}} onClick={() => setIsAssignModalVisible(false)}>Đóng</button>
            </div>
        </div>
    );
    
    const renderListView = () => (
        <div>
            <div className="page-header">
                <h2>Quản lý Danh sách Học viên</h2>
                <button className="btn-add-new" onClick={handleOpenAssignModal}>
                    Phân công Học viên
                </button>
            </div>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Tên Học viên</th>
                            <th>Email</th>
                            <th>Gói tập hiện tại</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length > 0 ? members.map(member => {
                            const latestSubscription = member.MemberSubscriptions?.sort((a, b) => new Date(b.end_date) - new Date(a.end_date))[0];
                            return (
                                <tr key={member.user_id}>
                                    <td>{member.Profile?.full_name || 'N/A'}</td>
                                    <td>{member.email}</td>
                                    <td>{latestSubscription?.MembershipPackage?.package_name || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${(latestSubscription?.activityStatus || 'unknown').toLowerCase()}`}>
                                            {latestSubscription?.activityStatus || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button className="btn-view" onClick={() => handleViewDetails(member.user_id)}>Xem</button>
                                        <button className="btn-edit" onClick={() => handleEditClick(member)}>Sửa</button>
                                        <button className="btn-delete" onClick={() => handleDelete(member.user_id)}>Xóa</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr><td colSpan="5" className="no-data-cell">Chưa có học viên nào được phân công.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDetailView = () => (
        <div>
            <button className="btn-back-dashboard" onClick={() => setView('list')}>← Quay lại danh sách</button>
            <h2>Chi tiết Học viên: {selectedMember.Profile.full_name}</h2>
            {/* ... detailed view content ... */}
        </div>
    );

    const renderEditView = () => (
        <div>
            <button className="btn-back-dashboard" onClick={() => setView('list')}>← Hủy bỏ</button>
            <h2>Chỉnh sửa Học viên: {selectedMember.Profile.full_name}</h2>
            <form onSubmit={handleUpdateSubmit} className="edit-form">
                {/* ... edit form inputs ... */}
            </form>
        </div>
    );

    return (
        <div className="management-page-container">
            {isAssignModalVisible && AssignMemberModal}
            <Link to="/dashboard" className="btn-back-dashboard">← Quay lại Dashboard</Link>
            
            {/* --- THIS IS THE FIX --- */}
            {view === 'list' && renderListView()}
            {view === 'details' && renderDetailView()}
            {view === 'edit' && renderEditView()}
        </div>
    );
};

export default TrainerMemberManagementPage;