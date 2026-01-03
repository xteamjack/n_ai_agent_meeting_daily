const axios = require("axios");
const { DAILY_API_KEY, DAILY_BASE_URL } = require("../config/env");

const headers = {
  Authorization: `Bearer ${DAILY_API_KEY}`,
};

async function createRoom() {
  const res = await axios.post(
    `${DAILY_BASE_URL}/rooms`,
    {
      properties: {
        enable_recording: "cloud",
        enable_chat: false,
      },
    },
    { headers }
  );
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
  await axios.delete(`${DAILY_BASE_URL}/rooms/${roomName}`, { headers });
}

module.exports = {
  createRoom,
  createMeetingToken,
  endRoom,
};
