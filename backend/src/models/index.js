'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const sequelize = require('../config/db'); // Your custom db config import
const db = {};

// Read all model files from the current directory, excluding this index file
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // Import each model file and initialize it with sequelize
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });

// Run the associate function for each model, if it exists
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

// --- NOW, MANUALLY DEFINE THE ASSOCIATIONS ---
// This provides a clear, single place to see all relationships.

const { User, Profile, MemberSubscription, MembershipPackage, Equipment } = db;

// User <-> Profile
User.hasOne(Profile, { foreignKey: 'user_id', as: 'Profile' });
Profile.belongsTo(User, { foreignKey: 'user_id' });

// User <-> MemberSubscription
User.hasMany(MemberSubscription, { foreignKey: 'member_user_id' });
MemberSubscription.belongsTo(User, { foreignKey: 'member_user_id' });

// MembershipPackage <-> MemberSubscription
MembershipPackage.hasMany(MemberSubscription, { foreignKey: 'package_id' });
MemberSubscription.belongsTo(MembershipPackage, { foreignKey: 'package_id' });

// A User (member) can submit many feedback items.
db.User.hasMany(db.Feedback, { foreignKey: 'member_user_id', as: 'SubmittedFeedback' });
db.Feedback.belongsTo(db.User, { foreignKey: 'member_user_id', as: 'SubmittingMember' });

// You can add more associations here...


module.exports = db;