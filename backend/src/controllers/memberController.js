const pool = require('../config/db');
const bcrypt = require('bcryptjs');

function generateMemberCode() {
  return 'HV' + Math.floor(100000 + Math.random() * 900000);
}
function generateUsername(phone) {
  return 'user' + phone.slice(-6);
}
function generatePassword() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

exports.registerMember = async (req, res) => {
  const { fullName, dob, phone, email } = req.body;
  if (!fullName || !dob || !phone) {
    return res.status(400).json({ msg: 'Họ tên, ngày sinh, số điện thoại là bắt buộc.' });
  }
  try {
    // Check for duplicate phone
    const existing = await pool.query('SELECT * FROM profiles WHERE phone_number = $1', [phone]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ msg: 'Số điện thoại đã tồn tại.' });
    }
    const memberCode = generateMemberCode();
    const username = generateUsername(phone);
    const password = generatePassword();
    const passwordHash = await bcrypt.hash(password, 10);
    // Insert user
    const userRes = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING user_id',
      [email || null, passwordHash, 'member']
    );
    const userId = userRes.rows[0].user_id;
    // Insert profile
    await pool.query(
      'INSERT INTO profiles (user_id, full_name, date_of_birth, phone_number, member_code) VALUES ($1, $2, $3, $4, $5)',
      [userId, fullName, dob, phone, memberCode]
    );
    res.json({ memberCode, username, password });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi đăng ký hội viên.' });
  }
};

// Get member by member code
exports.getMemberByCode = async (req, res) => {
  const { code } = req.params;
  try {
    const member = await pool.query(
      `SELECT p.full_name, p.member_code, ms.end_date as current_package_end_date, mp.package_name as current_package_name
       FROM profiles p
       LEFT JOIN member_subscriptions ms ON ms.member_user_id = p.user_id AND (ms.end_date IS NULL OR ms.end_date >= CURRENT_DATE)
       LEFT JOIN membership_packages mp ON ms.package_id = mp.package_id
       WHERE p.member_code = $1
       ORDER BY ms.end_date DESC NULLS LAST
       LIMIT 1`,
      [code]
    );
    if (!member.rows.length) {
      return res.status(404).json({ msg: 'Không tìm thấy hội viên.' });
    }
    const info = member.rows[0];
    res.json({
      fullName: info.full_name,
      memberCode: info.member_code,
      currentPackageEndDate: info.current_package_end_date,
      currentPackageName: info.current_package_name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi tìm hội viên.' });
  }
};

// Renew member package
exports.renewMemberPackage = async (req, res) => {
  const { memberCode, packageId, months } = req.body;
  if (!memberCode || !packageId || !months) {
    return res.status(400).json({ msg: 'Thiếu thông tin gia hạn.' });
  }
  try {
    // Get user_id from memberCode
    const memberRes = await pool.query('SELECT user_id FROM profiles WHERE member_code = $1', [memberCode]);
    if (!memberRes.rows.length) {
      return res.status(404).json({ msg: 'Không tìm thấy hội viên.' });
    }
    const userId = memberRes.rows[0].user_id;
    // Get package info
    const pkgRes = await pool.query('SELECT * FROM membership_packages WHERE package_id = $1', [packageId]);
    if (!pkgRes.rows.length) {
      return res.status(404).json({ msg: 'Không tìm thấy gói tập.' });
    }
    const pkg = pkgRes.rows[0];
    // Get current subscription
    const subRes = await pool.query(
      'SELECT * FROM member_subscriptions WHERE member_user_id = $1 ORDER BY end_date DESC NULLS LAST LIMIT 1',
      [userId]
    );
    let startDate = new Date();
    if (subRes.rows.length && subRes.rows[0].end_date && new Date(subRes.rows[0].end_date) > startDate) {
      startDate = new Date(subRes.rows[0].end_date);
      startDate.setDate(startDate.getDate() + 1);
    }
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + Number(months));
    // Calculate sessions
    const sessions = (pkg.sessions_per_month || 12) * Number(months);
    // Insert new subscription
    await pool.query(
      `INSERT INTO member_subscriptions (member_user_id, package_id, start_date, end_date, sessions_total, sessions_remaining, payment_status, payment_method, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $5, 'paid', 'staff', NOW(), NOW())`,
      [userId, packageId, startDate, endDate, sessions]
    );
    res.json({
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      remainingSessions: sessions,
      packageStatus: 'Đang hoạt động',
      paymentDate: new Date().toISOString().slice(0, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Lỗi server khi gia hạn gói tập.' });
  }
}; 