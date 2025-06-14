const pool = require('../config/db');

// Get all users with the role 'trainer'
exports.getAllTrainers = async (req, res) => {
  try {
    const query = `
      SELECT u.user_id, p.full_name
      FROM users u
      JOIN profiles p ON u.user_id = p.user_id
      WHERE u.role = 'trainer' 
      ORDER BY p.full_name;
    `;
    // This query assumes:
    // 1. The 'users' table has a column 'role' of type 'enum_users_role' (as per your image).
    // 2. The ENUM type 'enum_users_role' includes the literal string 'trainer'.
    // 3. The 'profiles' table has a 'user_id' that is a foreign key to 'users.user_id'.
    // 4. The 'profiles' table has a 'full_name' column.
    // 5. Trainers (users with role='trainer') MUST have an entry in the 'profiles' table to be listed,
    //    because of the INNER JOIN (JOIN defaults to INNER JOIN).

    const { rows } = await pool.query(query);
    res.json(rows); // This should send an array of {user_id, full_name} objects.
  } catch (error) {
    console.error('Error fetching trainers:', error);
    res.status(500).json({ msg: 'Server error while fetching trainers' });
  }
};
