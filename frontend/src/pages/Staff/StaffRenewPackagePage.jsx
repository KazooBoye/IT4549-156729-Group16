import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';

const StaffRenewPackagePage = () => {
  const [memberId, setMemberId] = useState('');
  const [newPackageId, setNewPackageId] = useState('');
  const [packages, setPackages] = useState([]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth  = useContext(AuthContext);

  // Fetch all available packages when the component loads
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/packages`);
        setPackages(res.data);
        if (res.data.length > 0) {
            setNewPackageId(res.data[0].package_id);
        }
      } catch (err) {
        setError('Failed to load packages. Please check the server connection.');
      }
    };
    fetchPackages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    if (!memberId || !newPackageId) {
      setError('Please enter a Member User ID and select a package.');
      setIsSubmitting(false);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      };
      
      const body = { 
        memberId: Number(memberId), 
        newPackageId: Number(newPackageId) 
      };

      const res = await axios.post(`${process.env.REACT_APP_API_URL}/members/extend-subscription`, body, config);
      
      setSuccess(`${res.data.msg} New end date for member ${memberId}: ${new Date(res.data.newSubscription.end_date).toLocaleDateString()}`);
      setMemberId(''); // Clear the member ID field for the next use

    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred during extension.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h2 style={{marginTop: '1rem'}}>Gia hạn gói tập cho hội viên</h2>
      <p>Enter the member's User ID and select the new package to add to their subscription.</p>
      
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', border: '1px solid green', padding: '10px' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Member User ID:</label>
          <input
            type="number"
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            placeholder="Enter User ID (e.g., 1, 2, 3...)"
            required
            style={{ display: 'block', width: '300px', margin: '5px 0', padding: '8px' }}
          />
        </div>
        <div style={{marginTop: '1rem'}}>
          <label>New Package to Extend:</label>
          <select
            value={newPackageId}
            onChange={(e) => setNewPackageId(e.target.value)}
            required
            style={{ display: 'block', width: '300px', margin: '5px 0', padding: '8px' }}
          >
            {packages.map((pkg) => (
              <option key={pkg.package_id} value={pkg.package_id}>
                {pkg.package_name} - {Number(pkg.price).toLocaleString()} VND
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={isSubmitting} style={{marginTop: '1.5rem'}}>
          {isSubmitting ? 'Extending...' : 'Extend Subscription'}
        </button>
      </form>
    </div>
  );
};

export default StaffRenewPackagePage;