import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import axios from 'axios';

const CATEGORIES = [
  {
    key: 'gymService',
    label: 'Dịch vụ phòng tập',
    description: 'Dịch vụ hỗ trợ, tư vấn, chăm sóc khách hàng',
    requireComment: true,
    commentMaxWords: 1000,
  },
  {
    key: 'equipment',
    label: 'Thiết bị tập',
    description: '',
    requireComment: true,
    commentMaxWords: 1000,
  },
  {
    key: 'trainer',
    label: 'Huấn luyện viên',
    description: '',
    requireComment: true,
    commentMaxWords: 1000,
  },
  {
    key: 'staff',
    label: 'Nhân viên',
    description: 'Nhân viên lễ tân, tư vấn',
    requireComment: true,
    commentMaxWords: 1000,
  },
];

const initialRatings = CATEGORIES.reduce((acc, cat) => {
  acc[cat.key] = 5;
  return acc;
}, {});
const initialComments = CATEGORIES.reduce((acc, cat) => {
  acc[cat.key] = '';
  return acc;
}, {});

const ServiceUserRatingPage = () => {
  const { user, token } = useContext(AuthContext);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [ratings, setRatings] = useState(initialRatings);
  const [comments, setComments] = useState(initialComments);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCategoryChange = (key) => {
    setSelectedCategory(key);
  };

  const handleRatingChange = (key, value) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleCommentChange = (key, value) => {
    setComments((prev) => ({ ...prev, [key]: value }));
  };

  const countWords = (str) => str.trim().split(/\s+/).filter(Boolean).length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!selectedCategory) {
      setError('Vui lòng chọn một đối tượng để đánh giá.');
      return;
    }

    const cat = CATEGORIES.find((c) => c.key === selectedCategory);
    if (!ratings[selectedCategory]) {
      setError(`Vui lòng đánh giá sao cho "${cat.label}".`);
      return;
    }
    if (cat.requireComment) {
      const comment = comments[selectedCategory].trim();
      if (!comment) {
        setError(`Vui lòng nhập nhận xét cho "${cat.label}".`);
        return;
      }
      if (countWords(comment) > cat.commentMaxWords) {
        setError(`Nhận xét cho "${cat.label}" không được vượt quá ${cat.commentMaxWords} từ.`);
        return;
      }
    }

    try {
      // Send to backend
      await axios.post(
        `${process.env.REACT_APP_API_URL}/feedback`,
        {
          userId: user?.id,
          category: selectedCategory,
          rating: ratings[selectedCategory],
          comment: comments[selectedCategory],
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess('Cảm ơn bạn đã gửi đánh giá!');
      setSelectedCategory('');
      setRatings(initialRatings);
      setComments(initialComments);
    } catch (err) {
      setError(err.response?.data?.msg || 'Không thể gửi đánh giá. Vui lòng thử lại sau.');
    }
  };

  const renderStarRating = (key, value) => (
    <div className="star-rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => handleRatingChange(key, star)}
          style={{
            cursor: 'pointer',
            fontSize: '24px',
            color: star <= value ? '#ffd700' : '#ccc',
            marginRight: '5px',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Đánh giá chất lượng dịch vụ</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <strong>Chọn đối tượng muốn đánh giá:</strong>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: '10px' }}>
            {CATEGORIES.map((cat) => (
              <label key={cat.key} style={{ minWidth: '200px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="category"
                  checked={selectedCategory === cat.key}
                  onChange={() => handleCategoryChange(cat.key)}
                  style={{ marginRight: '8px' }}
                />
                {cat.label}
                {cat.description && <span style={{ color: '#888', fontSize: '0.9em', marginLeft: '5px' }}>({cat.description})</span>}
              </label>
            ))}
          </div>
        </div>
        {selectedCategory && (() => {
          const cat = CATEGORIES.find((c) => c.key === selectedCategory);
          return (
            <div key={cat.key} style={{ marginBottom: '30px', border: '1px solid #eee', borderRadius: '8px', padding: '15px' }}>
              <h4 style={{ marginBottom: '10px' }}>{cat.label}</h4>
              {renderStarRating(cat.key, ratings[cat.key])}
              {cat.requireComment && (
                <div style={{ marginTop: '10px' }}>
                  <label htmlFor={`comment-${cat.key}`}>Nhận xét (bắt buộc, tối đa {cat.commentMaxWords} từ):</label>
                  <textarea
                    id={`comment-${cat.key}`}
                    value={comments[cat.key]}
                    onChange={(e) => handleCommentChange(cat.key, e.target.value)}
                    rows="4"
                    style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    placeholder={`Nhập nhận xét cho ${cat.label}...`}
                  />
                  <div style={{ fontSize: '0.9em', color: countWords(comments[cat.key]) > cat.commentMaxWords ? 'red' : '#888' }}>
                    {countWords(comments[cat.key])} / {cat.commentMaxWords} từ
                  </div>
                </div>
              )}
            </div>
          );
        })()}
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Gửi đánh giá
        </button>
      </form>
    </div>
  );
};

export default ServiceUserRatingPage; 