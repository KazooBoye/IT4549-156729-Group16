const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create a new Sequelize instance using your environment variables
const sequelize = new Sequelize(
  process.env.DB_DATABASE,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'postgres', //  <-- Tell Sequelize you're using PostgreSQL
    logging: false, // Set to console.log to see the generated SQL queries
  }
);

// This is the crucial line. It exports the initialized Sequelize instance.
module.exports = sequelize;