import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../../contexts/AuthContext';

const MemberBookingPage = () => {
  const { user, token } = useContext(AuthContext);
  const [trainers, setTrainers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [isLoadingTrainers, setIsLoadingTrainers] = useState(false);
  const [isLoadingBookings, setIsLoadingBookings] = useState(false);

  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [sessionDateTime, setSessionDateTime] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60); // Default duration
  const [notes, setNotes] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch available trainers
  useEffect(() => {
    const fetchTrainers = async () => {
      if (!token) {
        // setError('Authentication token not found. Cannot fetch trainers.'); // Optional: more specific error
        return;
      }
      setIsLoadingTrainers(true);
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/users/trainers`, {
          headers: { 'x-auth-token': token }, // Ensure your backend authMiddleware expects 'x-auth-token'
        });
        // console.log('Fetched trainers:', res.data); // Good place for debugging
        setTrainers(res.data); // Expects res.data to be an array like [{user_id: 1, full_name: "Trainer Name"}, ...]
      } catch (err) {
        setError(err.response?.data?.msg || 'Failed to fetch trainers.');
        console.error('Error fetching trainers from frontend:', err);
      } finally {
        setIsLoadingTrainers(false);
      }
    };
    fetchTrainers();
  }, [token]);

  // Fetch member's existing bookings
  const fetchBookings = async () => {
    if (!token) return;
    setIsLoadingBookings(true);
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/member`, {
        headers: { 'x-auth-token': token },
      });
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to fetch your bookings.');
      console.error(err);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);


  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!selectedTrainerId || !sessionDateTime) {
      setError('Please select a trainer and session date/time.');
      return;
    }
    if (!token) {
        setError('Authentication error. Please log in again.');
        return;
    }

    try {
      const bookingData = {
        trainer_user_id: parseInt(selectedTrainerId),
        session_datetime: new Date(sessionDateTime).toISOString(),
        duration_minutes: parseInt(durationMinutes),
        notes_member: notes,
      };
      await axios.post(`${process.env.REACT_APP_API_URL}/bookings`, bookingData, {
        headers: { 'x-auth-token': token },
      });
      setSuccess('Booking successful!');
      setSelectedTrainerId('');
      setSessionDateTime('');
      setDurationMinutes(60);
      setNotes('');
      fetchBookings(); // Refresh bookings list
    } catch (err) {
      setError(err.response?.data?.msg || 'Booking failed. Please try again.');
      console.error(err);
    }
  };

  const formatLocalDateTime = (isoString) => {
    if (!isoString) return 'N/A';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
  };


  return (
    <div>
      <Link to="/dashboard" style={{ display: 'inline-block', marginBottom: '20px', padding: '10px 15px', backgroundColor: '#6c757d', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
        &larr; Back to Dashboard
      </Link>
      <h2>Đặt lịch tập với Huấn luyện viên</h2>

      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>{error}</p>}
      {success && <p style={{ color: 'green', border: '1px solid green', padding: '10px' }}>{success}</p>}

      <form onSubmit={handleBookingSubmit} style={{ marginBottom: '30px', padding: '20px', border: '1px solid #eee', borderRadius: '8px', background: '#f9f9f9' }}>
        <h4>Tạo Lịch hẹn mới</h4>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="trainerSelect" style={{ display: 'block', marginBottom: '5px' }}>Chọn Huấn luyện viên:</label>
          {isLoadingTrainers ? <p>Loading trainers...</p> : (
            <select
              id="trainerSelect"
              value={selectedTrainerId}
              onChange={(e) => setSelectedTrainerId(e.target.value)}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">-- Chọn HLV --</option>
              {trainers.map((trainer) => (
                <option key={trainer.user_id} value={trainer.user_id}>
                  {trainer.full_name}
                </option>
              ))}
            </select>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="sessionDateTime" style={{ display: 'block', marginBottom: '5px' }}>Ngày và Giờ tập:</label>
          <input
            type="datetime-local"
            id="sessionDateTime"
            value={sessionDateTime}
            onChange={(e) => setSessionDateTime(e.target.value)}
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="durationMinutes" style={{ display: 'block', marginBottom: '5px' }}>Thời lượng (phút):</label>
          <input
            type="number"
            id="durationMinutes"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            min="30"
            step="15"
            required
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="notes" style={{ display: 'block', marginBottom: '5px' }}>Ghi chú (tùy chọn):</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Đặt lịch
        </button>
      </form>

      <h4>Lịch đã đặt của bạn:</h4>
      {isLoadingBookings ? <p>Loading your bookings...</p> : bookings.length > 0 ? (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {bookings.map((booking) => (
            <li key={booking.booking_id} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ddd', borderRadius: '5px', background: '#fff' }}>
              <p><strong>Huấn luyện viên:</strong> {booking.trainer_name} ({booking.trainer_email})</p>
              <p><strong>Thời gian:</strong> {formatLocalDateTime(booking.session_datetime)}</p>
              <p><strong>Thời lượng:</strong> {booking.duration_minutes} phút</p>
              <p><strong>Trạng thái:</strong> <span style={{ fontWeight: 'bold', color: booking.status === 'scheduled' ? 'blue' : (booking.status === 'completed' ? 'green' : 'red') }}>{booking.status}</span></p>
              {booking.notes_member && <p><strong>Ghi chú của bạn:</strong> {booking.notes_member}</p>}
              {booking.notes_trainer && <p><strong>Ghi chú của HLV:</strong> {booking.notes_trainer}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <p>Bạn chưa có lịch đặt nào.</p>
      )}
    </div>
  );
};

export default MemberBookingPage;