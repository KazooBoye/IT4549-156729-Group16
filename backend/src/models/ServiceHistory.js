// File: src/models/ServiceHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ServiceHistory = sequelize.define('ServiceHistory', {
  history_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memberUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'member_user_id',
  },
  recordedByStaffId: {
    type: DataTypes.INTEGER,
    field: 'recorded_by_staff_id',
  },
  serviceDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'service_date',
  },
  serviceId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'service_id',
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    field: 'duration_minutes',
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'service_history',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = ServiceHistory;