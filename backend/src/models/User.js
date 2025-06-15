// This file would typically define a schema if using an ORM like Sequelize or TypeORM.
// For raw pg, SQL queries will be constructed in services/controllers.
// Example structure for conceptual understanding:

/*
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('guest', 'member', 'staff', 'trainer', 'owner')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE profiles (
    profile_id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    date_of_birth DATE,
    phone_number VARCHAR(20),
    address TEXT,
    occupation VARCHAR(100),
    profile_picture_url VARCHAR(255),
    fingerprint_data TEXT, -- Consider security implications
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
*/
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('member', 'staff', 'trainer', 'owner'),
    allowNull: false,
  },
}, {
  tableName: 'users',
  createdAt: 'created_at',
  updatedAt: 'updated_at', // Assuming you don't have created_at/updated_at in the DB
});

module.exports = User;