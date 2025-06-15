// File: src/models/SystemSetting.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const SystemSetting = sequelize.define('SystemSetting', {
  setting_key: {
    type: DataTypes.STRING(50),
    primaryKey: true,
  },
  setting_value: {
    type: DataTypes.TEXT,
  },
  description: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'system_settings',
  timestamps: true,
  createdAt: false, // This table doesn't have a created_at column
  updatedAt: 'updated_at',
});

module.exports = SystemSetting;