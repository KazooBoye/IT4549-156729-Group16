const sequelize = require('../config/db');
const User = require('./User');
const Profile = require('./Profile');
const Equipment = require('./Equipment'); // Assuming you have this model too

const db = {};

db.sequelize = sequelize;
db.Sequelize = require('sequelize');

// --- EXPORT MODELS ---
db.User = User;
db.Profile = Profile;
db.Equipment = Equipment;
db.MembershipPackage = MembershipPackage;
db.MemberSubscription = MemberSubscription;


// --- DEFINE ASSOCIATIONS HERE ---

// A User has one Profile. The link is the 'user_id' field in the Profile table.
User.hasOne(Profile, {
  foreignKey: 'user_id',
  as: 'Profile' // Optional: creates an alias to use in includes
});

// A Profile belongs to one User.
Profile.belongsTo(User, {
  foreignKey: 'user_id'
});

// Add other associations here if needed in the future

// A User can have many subscriptions
User.hasMany(MemberSubscription, { foreignKey: 'member_user_id' });
MemberSubscription.belongsTo(User, { foreignKey: 'member_user_id' });

// A Package can be part of many subscriptions
MembershipPackage.hasMany(MemberSubscription, { foreignKey: 'package_id' });
MemberSubscription.belongsTo(MembershipPackage, { foreignKey: 'package_id' });


module.exports = db;