const axios = require("axios");
const { DAILY_API_KEY, DAILY_BASE_URL } = require("../config/env");

const headers = {
  Authorization: `Bearer ${DAILY_API_KEY}`,
};

async function createRoom(roomName) {
  const res = await axios.post(
    `${DAILY_BASE_URL}/rooms`,
    {
      name: roomName,
      properties: {
        enable_recording: "cloud",
        enable_chat: false,
      },
    },
    { headers }
  );
  console.log(`🏠 Room created: ${res.data.name} at ${res.data.url}`);
  return res.data;
}

async function createMeetingToken(roomName) {
  const res = await axios.post(
    `${DAILY_BASE_URL}/meeting-tokens`,
    {
      properties: {
        room_name: roomName,
        is_owner: true,
      },
    },
    { headers }
  );
  return res.data.token;
}

async function endRoom(roomName) {
  console.log(`🛑 Ending room: ${roomName}`);
  await axios.delete(`${DAILY_BASE_URL}/rooms/${roomName}`, { headers });
}

module.exports = {
  createRoom,
  createMeetingToken,
  endRoom,
};
