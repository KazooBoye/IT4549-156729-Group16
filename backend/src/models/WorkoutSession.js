// File: src/models/WorkoutSession.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WorkoutSession = sequelize.define('WorkoutSession', {
  session_id: {
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
  exercisePlan: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'exercise_plan',
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'duration_minutes',
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'Planned', // "Chưa thực hiện"
  },
  trainerNotes: {
    type: DataTypes.TEXT,
    field: 'trainer_notes',
  },
  evaluationScore: {
    type: DataTypes.INTEGER,
    field: 'evaluation_score',
    validate: {
      min: 0,
      max: 10
    }
  },
  evaluationComments: {
    type: DataTypes.TEXT,
    field: 'evaluation_comments',
  },
  goalCompletionStatus: {
    type: DataTypes.STRING(50),
    field: 'goal_completion_status', // e.g., 'Met', 'Not Met', 'Exceeded'
  },
  suggestionsForNextSession: {
    type: DataTypes.TEXT,
    field: 'suggestions_for_next_session',
  },
}, {
  tableName: 'workout_sessions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = WorkoutSession;