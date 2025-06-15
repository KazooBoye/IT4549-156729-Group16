// src/models/Equipment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Equipment = sequelize.define('Equipment', {
  equipment_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  equipment_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  room_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
  },
  date_acquired: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  warranty_expires_on: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'operational',
  },
}, {
  tableName: 'equipment',
  timestamps: true, // Sequelize sẽ tự quản lý created_at và updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Equipment;