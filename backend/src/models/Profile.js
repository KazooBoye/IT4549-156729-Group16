const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Profile = sequelize.define('Profile', {
  profile_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true, // This enforces the one-to-one relationship
  },
  full_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  date_of_birth: {
    type: DataTypes.DATEONLY, // Use DATEONLY for 'DATE' type
    allowNull: true,
  },
  phone_number: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  occupation: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  profile_picture_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  fingerprint_data: {
    type: DataTypes.TEXT, // Be very careful with storing this kind of data
    allowNull: true,
  },
  // Sequelize can manage timestamps automatically, but since your DB has a default
  // for 'updated_at', we can map it like this.
  // We'll set 'createdAt' to false as the table doesn't have it.
  updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'profiles',
  timestamps: true, // Enable timestamps
  updatedAt: 'updated_at', // Map the 'updatedAt' field to your 'updated_at' column
  createdAt: false, // Disable 'createdAt' as it's not in your table
});

module.exports = Profile;