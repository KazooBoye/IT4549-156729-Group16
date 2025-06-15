const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const MemberSubscription = sequelize.define('MemberSubscription', {
  subscription_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  // We use `field` to map the model's `memberUserId` to the table's `member_user_id` column
  memberUserId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'member_user_id',
  },
  packageId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'package_id',
  },
  start_date: {
    type: DataTypes.DATE,
  },
  end_date: {
    type: DataTypes.DATE,
  },
  sessions_total: {
    type: DataTypes.INTEGER,
  },
  sessions_remaining: {
    type: DataTypes.INTEGER,
  },
  payment_status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    allowNull: false,
    defaultValue: 'pending',
  },
  activityStatus: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'active',
    field: 'activity_status'
  },
  payment_method: {
    type: DataTypes.STRING(50),
  },
  transaction_id: {
    type: DataTypes.STRING, // The ID from the payment gateway (e.g., Stripe's pi_xxx)
  },
  notes: {
    type: DataTypes.TEXT,
  },
}, {
  tableName: 'member_subscriptions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

module.exports = MemberSubscription;