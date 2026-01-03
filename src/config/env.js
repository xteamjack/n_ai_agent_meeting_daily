require("dotenv").config();

module.exports = {
  PORT: process.env.PORT,
  DAILY_API_KEY: process.env.DAILY_API_KEY,
  DAILY_BASE_URL: process.env.DAILY_BASE_URL,
};
