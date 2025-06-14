const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const PersonalTrainingBooking = sequelize.define('PersonalTrainingBooking', {
  booking_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  memberUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'member_user_id',
  },
  trainerUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'trainer_user_id',
  },
  sessionDatetime: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'session_datetime',
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 60,
    field: 'duration_minutes',
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'scheduled', // e.g., scheduled, completed, cancelled
  },
  notesMember: {
    type: DataTypes.TEXT,
    field: 'notes_member',
  },
  notesTrainer: {
    type: DataTypes.TEXT,
    field: 'notes_trainer',
  },
  subscriptionId: {
    type: DataTypes.INTEGER,
    field: 'subscription_id',
  },
}, {
  tableName: 'personal_training_bookings',
  timestamps: true, // Assuming you have created_at/updated_at
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = PersonalTrainingBooking;