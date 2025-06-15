import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../../contexts/AuthContext';
// import axios from 'axios'; // For API calls in the future
import { Link } from 'react-router-dom'; // Import Link

const ViewPackagesPage = () => {
  const { user, token } = useContext(AuthContext); // Token might be needed for personalized offers in future
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackages = async () => {
      setIsLoading(true);
      setError('');
      try {
        // In a real app, you would fetch this data from the backend
        // For example:
        // const response = await axios.get(`${process.env.REACT_APP_API_URL}/packages`, {
        //   headers: { Authorization: `Bearer ${token}` } // If packages are user-specific or require auth
        // });
        // setPackages(response.data.packages);

        // For now, we'll use mock data
        const mockPackages = [
          { id: 'pkg1', name: 'Basic Monthly', description: 'Access to all gym equipment.', duration: '1 Month', price: '500,000 VND', features: ['Gym Access', 'Locker Room'] },
          { id: 'pkg2', name: 'Premium Quarterly', description: 'All Basic benefits plus group classes.', duration: '3 Months', price: '1,350,000 VND', features: ['Gym Access', 'Locker Room', 'Group Classes (Yoga, Zumba)'] },
          { id: 'pkg3', name: 'Gold Annual', description: 'All Premium benefits plus personal trainer consultation.', duration: '12 Months', price: '4,800,000 VND', features: ['Gym Access', 'Locker Room', 'Group Classes', '1 Personal Trainer Consultation', 'Sauna Access'] },
          { id: 'pkg4', name: 'PT Package - 10 Sessions', description: '10 sessions with a certified personal trainer.', duration: 'Flexible', price: '3,000,000 VND', features: ['10 PT Sessions', 'Customized Workout Plan'] },
        ];
        
        // Simulate API delay
        setTimeout(() => {
          setPackages(mockPackages);
          setIsLoading(false);
        }, 800);

      } catch (err) {
        // setError(err.response?.data?.msg || 'Failed to fetch packages.');
        // console.error('Package fetch error:', err);
        setError('Failed to fetch packages. (Simulated Error)'); // Simulating error for example
        setIsLoading(false);
      }
    };

    // Fetch packages if user is available, or for public view if not strictly protected
    // For this example, we assume it's a general view, but user context might be useful later.
    fetchPackages();

  }, [user, token]); // user and token dependency might be adjusted based on actual API needs

  if (isLoading) {
    return <p>Loading available packages...</p>;
  }

  if (error) {
    return (
      <div>
        <Link to="/member/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          &larr; Back to Dashboard
        </Link>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  if (packages.length === 0 && !error) { // Ensure error isn't also shown
    return (
      <div>
        <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          &larr; Back to Dashboard
        </Link>
        <p>No training packages currently available.</p>
      </div>
    );
  }

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Available Training Packages</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {packages.map((pkg) => (
          <div key={pkg.id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', width: '300px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3>{pkg.name}</h3>
            <p>{pkg.description}</p>
            <p><strong>Duration:</strong> {pkg.duration}</p>
            <p><strong>Price:</strong> {pkg.price}</p>
            {pkg.features && pkg.features.length > 0 && (
              <>
                <strong>Features:</strong>
                <ul style={{ paddingLeft: '20px', marginTop: '5px' }}>
                  {pkg.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </>
            )}
            <button style={{ marginTop: '10px', padding: '8px 15px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Learn More / Sign Up
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewPackagesPage;
