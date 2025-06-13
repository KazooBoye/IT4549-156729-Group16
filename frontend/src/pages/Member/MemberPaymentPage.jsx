import React, { useState, useEffect } from 'react';
// import axios from 'axios'; // For API calls

const MemberPaymentPage = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Simulate fetching packages
  useEffect(() => {
    // In a real app, fetch packages from the backend
    const mockPackages = [
      { id: 'pkg1', name: 'Gói 1 Tháng - Standard', price: 500000 },
      { id: 'pkg2', name: 'Gói 3 Tháng - Premium', price: 1350000 },
      { id: 'pkg3', name: 'Gói 1 Năm - VIP', price: 4800000 },
      { id: 'pt_pkg1', name: 'Gói 10 buổi PT', price: 3000000 },
    ];
    setPackages(mockPackages);
    if (mockPackages.length > 0) {
      setSelectedPackage(mockPackages[0].id);
    }
  }, []);

  const handlePackageChange = (e) => {
    setSelectedPackage(e.target.value);
  };

  const handlePaymentDetailsChange = (e) => {
    setPaymentDetails({ ...paymentDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedPackage) {
      setError('Please select a package.');
      return;
    }
    // Basic validation for payment details (very simplified)
    if (!paymentDetails.cardNumber || !paymentDetails.expiryDate || !paymentDetails.cvv) {
        setError('Please fill in all payment details.');
        return;
    }

    try {
      // Placeholder for API call to process payment
      console.log('Processing payment for package:', selectedPackage, 'with details:', paymentDetails);
      // const response = await axios.post(`${process.env.REACT_APP_API_URL}/payments`, {
      //   packageId: selectedPackage,
      //   paymentInfo: paymentDetails,
      // });
      setSuccess(`Payment for package ${packages.find(p => p.id === selectedPackage)?.name} successful! (Simulated)`);
      // Reset form or navigate
      setPaymentDetails({ cardNumber: '', expiryDate: '', cvv: ''});
    } catch (err) {
      setError(err.response?.data?.msg || 'Payment failed.');
      console.error('Payment error:', err);
    }
  };

  return (
    <div>
      <h2>Thanh toán Gói tập</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="packageSelect">Chọn Gói tập:</label>
          <select id="packageSelect" value={selectedPackage} onChange={handlePackageChange} required>
            <option value="" disabled>-- Select a Package --</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} - {pkg.price.toLocaleString()} VND
              </option>
            ))}
          </select>
        </div>

        <h4>Chi tiết Thanh toán (Mô phỏng)</h4>
        <div>
          <label htmlFor="cardNumber">Số thẻ:</label>
          <input
            type="text"
            id="cardNumber"
            name="cardNumber"
            value={paymentDetails.cardNumber}
            onChange={handlePaymentDetailsChange}
            placeholder="---- ---- ---- ----"
            required
          />
        </div>
        <div>
          <label htmlFor="expiryDate">Ngày hết hạn (MM/YY):</label>
          <input
            type="text"
            id="expiryDate"
            name="expiryDate"
            value={paymentDetails.expiryDate}
            onChange={handlePaymentDetailsChange}
            placeholder="MM/YY"
            required
          />
        </div>
        <div>
          <label htmlFor="cvv">CVV:</label>
          <input
            type="text"
            id="cvv"
            name="cvv"
            value={paymentDetails.cvv}
            onChange={handlePaymentDetailsChange}
            placeholder="---"
            required
          />
        </div>
        <button type="submit">Thanh toán</button>
      </form>
    </div>
  );
};

export default MemberPaymentPage;
