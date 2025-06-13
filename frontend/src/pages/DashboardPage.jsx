import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext'; // Import AuthContext

const DashboardPage = () => {
    // const [user, setUser] = useState(null); // Replaced by context
    const { user, logout } = useContext(AuthContext); // Use user from context
    const navigate = useNavigate();

    useEffect(() => {
        // User is now managed by AuthContext, which handles localStorage
        if (!user) {
            // If AuthContext is still loading or user is not found, redirect
            // AuthContext's loading state could be used for a better loading experience
            const token = localStorage.getItem('token');
            if (!token) {
                 navigate('/login');
            }
            // If token exists but user is not yet in context, AuthContext might still be initializing
            // Or, if user is null after context loading, then redirect.
        }
    }, [user, navigate]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) {
        return <p>Loading dashboard or redirecting...</p>; // Or a loading spinner
    }

    // Render different content based on user role
    const renderDashboardContent = () => {
        switch (user.role) {
            case 'member':
                return (
                    <>
                        <h3>Welcome Member, {user.fullName}!</h3>
                        <h4>Your Functions:</h4>
                        <ul>
                            <li><Link to="/member/payment">Thanh toán gói tập</Link></li>
                            <li><Link to="/member/profile">Xem và cập nhật thông tin cá nhân</Link></li>
                            <li><Link to="/member/history">Xem lịch sử tập luyện</Link></li>
                            <li><Link to="/member/feedback">Đánh giá chất lượng dịch vụ</Link></li>
                            <li><Link to="/packages/view">Xem thông tin các gói tập</Link></li>
                            <li><Link to="/member/booking">Đặt lịch tập với huấn luyện viên</Link></li>
                        </ul>
                    </>
                );
            case 'staff':
                return (
                    <>
                        <h3>Welcome Staff, {user.fullName}!</h3>
                        <h4>Your Functions:</h4>
                        <ul>
                            <li><Link to="/staff/equipment">Cập nhật tình trạng thiết bị</Link></li>
                            <li><Link to="/staff/register-member">Đăng ký hội viên mới</Link></li>
                            <li><Link to="/staff/renew-package">Gia hạn gói tập cho hội viên</Link></li>
                            <li><Link to="/staff/feedback-management">Xử lý phản hồi từ hội viên</Link></li>
                            <li><Link to="/staff/member-service-history">Ghi nhận lịch sử sử dụng dịch vụ</Link></li>
                        </ul>
                    </>
                );
            case 'trainer':
                return (
                    <>
                        <h3>Welcome Trainer, {user.fullName}!</h3>
                        <h4>Your Functions:</h4>
                        <ul>
                            <li><Link to="/trainer/my-members">Danh sách học viên</Link></li>
                            <li><Link to="/trainer/member-progress">Theo dõi và cập nhật tiến độ học viên</Link></li>
                            <li><Link to="/trainer/evaluate-results">Đánh giá kết quả luyện tập</Link></li>
                        </ul>
                    </>
                );
            case 'owner':
                return (
                    <>
                        <h3>Welcome Owner, {user.fullName}! (Admin Dashboard)</h3>
                        <h4>Management Functions:</h4>
                        <h5>User Management</h5>
                        <ul>
                            <li><Link to="/admin/manage-users">Quản trị người dùng</Link></li>
                            {/* Assign roles and permissions might be part of manage-users or separate */}
                        </ul>
                        <h5>Gym Operations</h5>
                        <ul>
                            <li><Link to="/admin/gym-info">Quản lý thông tin phòng tập</Link></li>
                            <li><Link to="/admin/manage-equipment">Quản lý thiết bị tập luyện</Link></li>
                            <li><Link to="/admin/manage-staff">Quản lý nhân sự</Link></li>
                            <li><Link to="/admin/manage-feedback">Quản lý phản hồi hội viên</Link></li>
                            <li><Link to="/admin/manage-packages">Quản lý gói tập</Link></li>
                        </ul>
                        <h5>Reporting</h5>
                        <ul>
                            <li><Link to="/admin/reports/revenue">Báo cáo doanh thu</Link></li>
                            <li><Link to="/admin/reports/registrations">Báo cáo đăng ký và gia hạn</Link></li>
                            <li><Link to="/admin/reports/staff-performance">Báo cáo hiệu suất nhân viên</Link></li>
                        </ul>
                         {/* Include staff functions if owner also performs them */}
                         <h5>Staff Functions (if applicable)</h5>
                         <ul>
                            <li><Link to="/staff/equipment">Cập nhật tình trạng thiết bị</Link></li>
                            <li><Link to="/staff/register-member">Đăng ký hội viên mới</Link></li>
                            {/* ... other staff functions */}
                        </ul>
                    </>
                );
            default:
                return <h3>Welcome, {user.fullName}! Your role ({user.role}) is not fully configured for a dashboard view.</h3>;
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Dashboard</h2>
                <button onClick={handleLogout}>Logout</button>
            </div>
            {renderDashboardContent()}
        </div>
    );
};

export default DashboardPage;
