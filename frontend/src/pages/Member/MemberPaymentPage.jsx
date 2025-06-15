import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SimulatedPaymentForm from './SimulatedPaymentForm'; // Import the new component

const MemberPaymentPage = () => {
  // State for data fetched from the backend
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for user interaction
  const [selectedPackageId, setSelectedPackageId] = useState('');

  // State for showing top-level feedback
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch active packages from the backend when the component mounts
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/packages`);
        setPackages(response.data);
        // Automatically select the first package if available
        if (response.data.length > 0) {
          setSelectedPackageId(response.data[0].package_id);
        }
      } catch (err) {
        setError('Could not load membership packages. Please try again later.');
        console.error('Fetch packages error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Find the full object for the selected package
  const selectedPackage = packages.find(
    (pkg) => pkg.package_id === selectedPackageId
  );

  const handlePaymentSuccess = (data) => {
    setSuccess(`Successfully subscribed to ${selectedPackage?.package_name}!`);
    setError('');
    // Optionally, you could navigate the user away or refresh their subscription data
  };

  const handlePaymentError = (errorMessage) => {
    setError(errorMessage);
    setSuccess('');
  };

  if (isLoading) {
    return <div>Loading packages...</div>;
  }

  return (
    <div>
      <h2>Thanh toán Gói tập</h2>
      {/* Display top-level success/error messages here */}
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', border: '1px solid green', padding: '10px' }}>{success}</p>}

      <div style={{ marginBottom: '2rem' }}>
        <label htmlFor="packageSelect">Chọn Gói tập:</label>
        <select
          id="packageSelect"
          value={selectedPackageId}
          onChange={(e) => setSelectedPackageId(Number(e.target.value))} // Convert value to Number
          required
        >
          {packages.map((pkg) => (
            <option key={pkg.package_id} value={pkg.package_id}>
              {pkg.package_name} - {Number(pkg.price).toLocaleString()} VND
            </option>
          ))}
        </select>
      </div>

      {/* --- Integration of the Simulated Payment Form --- */}
      {/* Only show the payment form if a package has been selected */}
      {selectedPackage ? (
        <SimulatedPaymentForm
          // Pass the necessary props to the child component
          packageId={selectedPackage.package_id}
          packagePrice={selectedPackage.price}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
        />
      ) : (
        <p>Please select a package to see payment options.</p>
      )}
    </div>
  );
};

export default MemberPaymentPage;