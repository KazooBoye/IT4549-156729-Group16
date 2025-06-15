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

    // Define styles for the button-like links and the ul container
    const buttonLinkStyle = {
        display: 'block',
        padding: '10px 15px',
        margin: '8px 0',
        backgroundColor: '#007bff',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px',
        textAlign: 'center',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
    };

    const ulStyle = {
        listStyleType: 'none',
        padding: 0,
        margin: '10px 0 20px 0',
    };

    // Render different content based on user role
    const renderDashboardContent = () => {
        switch (user.role) {
            case 'member':
                return (
                    <>
                        <h3>Welcome Member, {user.fullName}!</h3>
                        <h4>Your Functions:</h4>
                        <ul style={ulStyle}>
                            <li><Link to="/member/payment" style={buttonLinkStyle}>Thanh toán gói tập</Link></li>
                            <li><Link to="/member/profile" style={buttonLinkStyle}>Xem và cập nhật thông tin cá nhân</Link></li>
                            <li><Link to="/member/history" style={buttonLinkStyle}>Xem lịch sử tập luyện</Link></li>
                            <li><Link to="/member/feedback" style={buttonLinkStyle}>Đánh giá chất lượng dịch vụ</Link></li>
                            <li><Link to="/packages/view" style={buttonLinkStyle}>Xem thông tin các gói tập</Link></li>
                            <li><Link to="/member/booking" style={buttonLinkStyle}>Đặt lịch tập với huấn luyện viên</Link></li>
                        </ul>
                    </>
                );
            case 'staff':
                return (
                    <>
                        <h3>Welcome Staff, {user.fullName}!</h3>
                        <h4>Your Functions:</h4>
                        <ul style={ulStyle}>
                            <li><Link to="/staff/equipment" style={buttonLinkStyle}>Cập nhật tình trạng thiết bị</Link></li>
                            <li><Link to="/staff/register-member" style={buttonLinkStyle}>Đăng ký hội viên mới</Link></li>
                            <li><Link to="/staff/renew-package" style={buttonLinkStyle}>Gia hạn gói tập cho hội viên</Link></li>
                            <li><Link to="/staff/feedback-management" style={buttonLinkStyle}>Xử lý phản hồi từ hội viên</Link></li>
                            <li><Link to="/staff/member-service-history" style={buttonLinkStyle}>Ghi nhận lịch sử sử dụng dịch vụ</Link></li>
                        </ul>
                    </>
                );
            case 'trainer':
                return (
                    <>
                        <h3>Welcome Trainer, {user.fullName}!</h3>
                        <h4>Your Functions:</h4>
                        <ul style={ulStyle}>
                            <li><Link to="/trainer/my-members" style={buttonLinkStyle}>Danh sách học viên</Link></li>
                            <li><Link to="/trainer/member-progress" style={buttonLinkStyle}>Theo dõi và cập nhật tiến độ học viên</Link></li>
                            <li><Link to="/trainer/evaluate-member" style={buttonLinkStyle}>Đánh giá kết quả luyện tập</Link></li>
                        </ul>
                    </>
                );
            case 'owner':
                return (
                    <>
                        <h3>Welcome Owner, {user.fullName}! (Admin Dashboard)</h3>
                        <h4>Management Functions:</h4>
                        <h5>User Management</h5>
                        <ul style={ulStyle}>
                            <li><Link to="/admin/manage-system" style={buttonLinkStyle}>Quản lý tổng thể hệ thống</Link></li>
                            <li><Link to="/admin/manage-users" style={buttonLinkStyle}>Quản trị người dùng</Link></li>
                            {/* Assign roles and permissions might be part of manage-users or separate */}
                        </ul>
                        <h5>Gym Operations</h5>
                        <ul style={ulStyle}>
                            <li><Link to="/admin/gym-info" style={buttonLinkStyle}>Quản lý thông tin phòng tập(Under Development)</Link></li>
                            <li><Link to="/admin/manage-equipment" style={buttonLinkStyle}>Quản lý thiết bị tập luyện</Link></li>
                            <li><Link to="/admin/manage-staff" style={buttonLinkStyle}>Quản lý nhân sự(Under Development)</Link></li>
                            <li><Link to="/admin/manage-feedback" style={buttonLinkStyle}>Quản lý phản hồi hội viên(Under Development)</Link></li>
                            <li><Link to="/admin/manage-packages" style={buttonLinkStyle}>Quản lý gói tập(Under Development)</Link></li>
                        </ul>
                        <h5>Reporting</h5>
                        <ul style={ulStyle}>
                            <li><Link to="/admin/reports/revenue" style={buttonLinkStyle}>Báo cáo doanh thu (Under Development)</Link></li>
                            <li><Link to="/admin/reports/registrations" style={buttonLinkStyle}>Báo cáo đăng ký và gia hạn(Under Development)</Link></li>
                            <li><Link to="/admin/reports/staff-performance" style={buttonLinkStyle}>Báo cáo hiệu suất nhân viên(Under Development)</Link></li>
                        </ul>
                         {/* Include staff functions if owner also performs them */}
                         <h5>Staff Functions</h5>
                         <ul style={ulStyle}>
                            <li><Link to="/staff/equipment" style={buttonLinkStyle}>Cập nhật tình trạng thiết bị</Link></li>
                            <li><Link to="/staff/register-member" style={buttonLinkStyle}>Đăng ký hội viên mới</Link></li>
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
