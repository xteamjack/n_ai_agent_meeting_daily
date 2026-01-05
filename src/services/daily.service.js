const axios = require("axios");
const { DAILY_API_KEY, DAILY_BASE_URL } = require("../config/env");

const headers = {
  Authorization: `Bearer ${DAILY_API_KEY}`,
};

async function createRoom(roomName) {
  try {
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
  } catch (err) {
    console.error("❌ Error creating room:", err.response?.data || err.message);
    throw err;
  }
}

async function configureGlobalWebhook() {
  const webhookUrl = "https://digihire.ai/daily/webhook";
  console.log(`🌐 Ensuring global webhook is set to: ${webhookUrl}`);

  try {
    // 1. Check existing webhooks
    const listRes = await axios.get(`${DAILY_BASE_URL}/webhooks`, { headers });
    const existing = listRes.data.data.find((w) => w.url === webhookUrl);

    if (existing) {
      console.log("✅ Webhook already exists.");
      return;
    }

    // 2. Create if not exists
    await axios.post(
      `${DAILY_BASE_URL}/webhooks`,
      {
        url: webhookUrl,
        events: ["recording.ready-to-download"],
      },
      { headers }
    );
    console.log("🚀 Global webhook created successfully!");
  } catch (err) {
    console.error(
      "❌ Failed to configure global webhook:",
      err.response?.data || err.message
    );
  }
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

// async function getRecordingAccessLink(recordingId) {
//   try {
//     const res = await axios.get(
//       `${DAILY_BASE_URL}/recordings/${recordingId}/access-link`,
//       { headers }
//     );
//     return res.data.download_url;
//   } catch (err) {
//     console.error(`❌ Error fetching access link for recording ${recordingId}:`, err.response?.data || err.message);
//     return null;
//   }
// }

// async function getRecordingAccessLink(recordingId) {
//   const res = await axios.get(
//     `https://api.daily.co/v1/recordings/${recordingId}/access-links`,
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
//       },
//     }
//   );

//   console.log(res.data)
//   const links = res.data?.data || [];

//   const mp4 = links.find(
//     (l) => l.type === "video" && l.format === "mp4"
//   );

//   return mp4?.url || null;
// }

async function getRecordingAccessLink(recordingId) {
  const res = await axios.get(
    `https://api.daily.co/v1/recordings/${recordingId}/access-link`,
    {
      headers: {
        Authorization: `Bearer ${process.env.DAILY_API_KEY}`,
      },
    }
  );

  console.log(res.data)
  return res.data?.download_link || null;
}


module.exports = {
  createRoom,
  createMeetingToken,
  endRoom,
  configureGlobalWebhook,
  getRecordingAccessLink,
};
