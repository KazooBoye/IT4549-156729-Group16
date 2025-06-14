import React, { useState } from 'react';
import axios from 'axios';

const SimulatedPaymentForm = ({ packageId, packagePrice, onPaymentSuccess, onPaymentError }) => {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [shouldSucceed, setShouldSucceed] = useState(true); // Checkbox to control outcome

  const handleSubmit = async (event) => {
    event.preventDefault();
    setProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token'); // Your auth token
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/payments/simulate`,
        {
          packageId,
          shouldSucceed,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle successful response from the backend
      setSuccess(response.data.msg);
      if (onPaymentSuccess) {
        onPaymentSuccess(response.data);
      }
    } catch (err) {
      // Handle error response from the backend (e.g., status 402 for failed payment)
      const errorMessage = err.response?.data?.msg || 'An unexpected error occurred.';
      setError(errorMessage);
      if (onPaymentError) {
        onPaymentError(errorMessage);
      }
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
      <h3>Simulated Payment</h3>
      <p>Paying ${packagePrice} for Package ID: {packageId}</p>
      <form onSubmit={handleSubmit}>
        {/* These fields are purely for visual effect */}
        <div>
          <label>Fake Card Number</label>
          <input type="text" placeholder="**** **** **** 4242" disabled style={{ width: '100%', margin: '5px 0' }} />
        </div>
        <div>
          <label>Fake CVV</label>
          <input type="text" placeholder="123" disabled style={{ width: '100px', margin: '5px 0' }} />
        </div>

        <div style={{ margin: '15px 0' }}>
          <input
            type="checkbox"
            id="simulateSuccess"
            checked={shouldSucceed}
            onChange={(e) => setShouldSucceed(e.target.checked)}
          />
          <label htmlFor="simulateSuccess"> Simulate a Successful Transaction</label>
        </div>

        {success && <div style={{ color: 'green', margin: '10px 0' }}>{success}</div>}
        {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

        <button type="submit" disabled={processing}>
          {processing ? 'Processing...' : `Pay $${packagePrice}`}
        </button>
      </form>
    </div>
  );
};

export default SimulatedPaymentForm;