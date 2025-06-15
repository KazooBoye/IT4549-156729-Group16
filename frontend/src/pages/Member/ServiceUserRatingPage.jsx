import React, { useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

// This is the detailed rating component that appears when a category is selected.
const RatingComponent = ({ title, onDataChange }) => {
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState('');

  // When rating or comments change, call the parent's handler
  const handleChange = (newRating, newComments) => {
    if (newRating !== undefined) setRating(newRating);
    if (newComments !== undefined) setComments(newComments);
    // Pass the complete state up to the parent
    onDataChange({
      rating: newRating !== undefined ? newRating : rating,
      comments: newComments !== undefined ? newComments : comments,
    });
  };

  return (
    <div style={{ border: '1px solid #e0e0e0', padding: '15px', marginTop: '0.5rem', borderRadius: '8px', background: '#fafafa' }}>
      <h5>{title}</h5>
      <div>
        <strong>Rating:</strong>
        {[1, 2, 3, 4, 5].map(star => (
          <span
            key={star}
            onClick={() => handleChange(star, undefined)}
            style={{ cursor: 'pointer', color: star <= rating ? 'gold' : 'grey', fontSize: '1.5rem', marginLeft: '5px' }}
          >
            ★
          </span>
        ))}
      </div>
      <textarea
        placeholder="Your comments..."
        value={comments}
        onChange={(e) => handleChange(undefined, e.target.value)}
        rows="3"
        style={{ width: '100%', marginTop: '10px' }}
        required
      />
    </div>
  );
};


const SubmitFeedbackPage = () => {
  // State to hold the data for the selected categories
  const [feedbackData, setFeedbackData] = useState({});
  // State to track which checkboxes are checked
  const [activeCategories, setActiveCategories] = useState({});

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const auth = useContext(AuthContext);

  const feedbackCategories = [
    { key: 'WorkoutServices', title: 'Dịch vụ phòng tập (Workout Services)' },
    { key: 'Equipment', title: 'Thiết bị tập (Equipment)' },
    { key: 'Trainers', title: 'Huấn luyện viên (Trainers)' },
    { key: 'Staff', title: 'Nhân viên (Staff)' },
  ];

  // This function is called when a checkbox is clicked
  const handleCategoryToggle = (categoryKey) => {
    const newActiveState = { ...activeCategories, [categoryKey]: !activeCategories[categoryKey] };
    setActiveCategories(newActiveState);

    // If a category is unchecked, remove its data to prevent submission
    if (!newActiveState[categoryKey]) {
      const newFeedbackData = { ...feedbackData };
      delete newFeedbackData[categoryKey];
      setFeedbackData(newFeedbackData);
    }
  };

  // This function is called by the child RatingComponent when its data changes
  const handleFeedbackDataChange = (categoryKey, data) => {
    setFeedbackData(prev => ({ ...prev, [categoryKey]: data }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');

    // Filter out only the data for active categories
    const feedbackPayload = Object.entries(feedbackData)
      .filter(([key]) => activeCategories[key])
      .map(([key, value]) => ({
        feedbackType: key,
        rating: value.rating,
        comments: value.comments,
      }));

    if (feedbackPayload.length === 0) {
      setError('Please select at least one category to provide feedback.');
      setIsSubmitting(false);
      return;
    }

    if (feedbackPayload.some(f => !f.rating || !f.comments)) {
        setError('Please provide a rating and comments for all selected categories.');
        setIsSubmitting(false);
        return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${auth.token}` } };
      
      await Promise.all(
        feedbackPayload.map(feedbackItem => 
            axios.post(`${process.env.REACT_APP_API_URL}/feedback`, feedbackItem, config)
        )
      );
      
      setSuccess('Thank you for your feedback!');
      setFeedbackData({});
      setActiveCategories({});

    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred while submitting feedback.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <Link to="/dashboard">← Back to Dashboard</Link>
      <h2 style={{marginTop: '1rem'}}>Đánh giá chất lượng dịch vụ</h2>
      <p>Select the categories you would like to rate.</p>
      
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', border: '1px solid green', padding: '10px' }}>{success}</p>}

      <form onSubmit={handleSubmit}>
        {feedbackCategories.map(({ key, title }) => (
          <div key={key} style={{ marginBottom: '1rem' }}>
            <label>
              <input
                type="checkbox"
                checked={!!activeCategories[key]}
                onChange={() => handleCategoryToggle(key)}
              />
              <strong style={{ marginLeft: '8px' }}>{title}</strong>
            </label>
            {/* Conditionally render the rating component */}
            {activeCategories[key] && (
              <RatingComponent
                title={title}
                onDataChange={(data) => handleFeedbackDataChange(key, data)}
              />
            )}
          </div>
        ))}
        
        <button type="submit" disabled={isSubmitting} style={{marginTop: '1rem'}}>
          {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

export default SubmitFeedbackPage;