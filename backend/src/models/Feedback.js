const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Feedback = sequelize.define('Feedback', {
  feedback_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memberUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'member_user_id',
  },
  feedbackType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'feedback_type',
  },
  rating: {
    type: DataTypes.INTEGER,
  },
  comments: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Submitted',
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    field: 'resolution_notes',
  },
}, {
  tableName: 'feedback',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = Feedback;