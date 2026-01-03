const axios = require("axios");
const { DAILY_API_KEY, DAILY_BASE_URL } = require("../config/env");

const headers = {
  Authorization: `Bearer ${DAILY_API_KEY}`,
};

async function getRecording(recordingId) {
  const res = await axios.get(`${DAILY_BASE_URL}/recordings/${recordingId}`, {
    headers,
  });
  return res.data;
}

module.exports = { getRecording };
