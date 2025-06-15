import React, { useState, useContext, useEffect } from 'react';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios'; // For API calls in the future
import { Link } from 'react-router-dom'; // Import Link

const MemberProfilePage = () => {
  const { user, setUser: updateUserContext, token } = useContext(AuthContext); // Renamed setAuthUser to updateUserContext for clarity
  
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    address: '',
    occupation: '',
    // profilePictureUrl: '', // For file uploads, more complex handling needed
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      // In a real app, you would fetch this data from the backend
      // For now, we'll use the user data from AuthContext and add placeholders
      setProfileData({
        fullName: user.fullName || '',
        email: user.email || '',
        dateOfBirth: user.dateOfBirth || '', // Assuming these fields might exist or be fetched
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        occupation: user.occupation || '',
      });
      setIsLoading(false);
    } else {
      // If user is null (e.g., after logout or if not logged in), redirect or show message
      // This might be handled by a protected route component in a real app
      setIsLoading(false);
      // Optionally, redirect to login or show an error/message
      // For now, we'll just ensure form fields are empty or disabled if no user.
      setProfileData({
        fullName: '', email: '', dateOfBirth: '', phoneNumber: '', address: '', occupation: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!user) {
      setError("No user logged in. Cannot update profile.");
      return;
    }
    try {
      // Placeholder for API call
      console.log('Updating profile with:', profileData);
      // const response = await axios.put(`${process.env.REACT_APP_API_URL}/profile/me`, profileData, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });
      // const updatedProfileFromServer = response.data.updatedProfile;
      // updateUserContext(updatedProfileFromServer); // Update context with data from server

      // Simulate updating AuthContext user (in real app, this comes from API response)
      // For simulation, we directly use profileData.
      // In a real app, only update context with what the server confirms and returns.
      const simulatedUpdate = { 
        fullName: profileData.fullName, 
        email: profileData.email,
        dateOfBirth: profileData.dateOfBirth,
        phoneNumber: profileData.phoneNumber,
        address: profileData.address,
        occupation: profileData.occupation,
      };
      updateUserContext(simulatedUpdate); // This will update context and localStorage
      setSuccess('Profile updated successfully! (Simulated)');

    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to update profile.');
      console.error('Profile update error:', err);
    }
  };

  if (isLoading) {
    return <p>Loading profile...</p>;
  }

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>My Profile</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="fullName">Full Name:</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={profileData.fullName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={profileData.email}
            onChange={handleChange}
            required
          // readOnly // Email might not be editable or require special verification
          />
        </div>
        <div>
          <label htmlFor="dateOfBirth">Date of Birth:</label>
          <input
            type="date"
            id="dateOfBirth"
            name="dateOfBirth"
            value={profileData.dateOfBirth}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={profileData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="address">Address:</label>
          <textarea
            id="address"
            name="address"
            value={profileData.address}
            onChange={handleChange}
            rows="3"
          ></textarea>
        </div>
        <div>
          <label htmlFor="occupation">Occupation:</label>
          <input
            type="text"
            id="occupation"
            name="occupation"
            value={profileData.occupation}
            onChange={handleChange}
          />
        </div>
        {/* Add profile picture upload later if needed */}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default MemberProfilePage;
