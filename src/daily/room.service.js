const axios = require("axios");

const DAILY_API = "https://api.daily.co/v1";
const headers = {
  Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
};

async function createRoom() {
  const res = await axios.post(
    `${DAILY_API}/rooms`,
    {
      properties: {
        enable_chat: false,
        enable_recording: "cloud",
        start_video_off: false,
        start_audio_off: false,
      },
    },
    { headers }
  );
  return res.data;
}

module.exports = { createRoom };
