import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios'; // For API calls

const ViewPackagesPage = () => {
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError('');
      try {
        // Simulate API call
        // const response = await axios.get(`${process.env.REACT_APP_API_URL}/packages`);
        // setPackages(response.data);
        const mockPackages = [
          { id: 'pkg1', name: 'Gói 1 Tháng - Standard', description: 'Truy cập không giới hạn tất cả các khu vực tập.', price: 500000, duration_days: 30, type: 'time_based' },
          { id: 'pkg2', name: 'Gói 3 Tháng - Premium', description: 'Bao gồm Standard + 2 buổi PT miễn phí.', price: 1350000, duration_days: 90, type: 'time_based' },
          { id: 'pkg3', name: 'Gói 1 Năm - VIP', description: 'Bao gồm Premium + khăn tập, nước uống.', price: 4800000, duration_days: 365, type: 'vip' },
          { id: 'pt_pkg1', name: 'Gói 10 buổi PT', description: '10 buổi tập luyện 1-1 với HLV cá nhân.', price: 3000000, type: 'personal_training' },
          { id: 'session_pkg', name: 'Gói theo buổi (10 buổi)', description: 'Linh hoạt tập luyện với 10 buổi.', price: 700000, type: 'session_based' },
        ];
        setPackages(mockPackages);
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch packages.');
        console.error('Fetch packages error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (isLoading) {
    return <p>Loading packages...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (packages.length === 0) {
    return <p>No packages available at the moment.</p>;
  }

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Các Gói tập Hiện có</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {packages.map((pkg) => (
          <div key={pkg.id} style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px', width: '300px' }}>
            <h3>{pkg.name}</h3>
            <p>{pkg.description}</p>
            <p><strong>Giá:</strong> {pkg.price.toLocaleString()} VND</p>
            <p><strong>Loại:</strong> {pkg.type}</p>
            {pkg.duration_days && <p><strong>Thời hạn:</strong> {pkg.duration_days} ngày</p>}
            {/* Add a button to subscribe or learn more if needed */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewPackagesPage;
