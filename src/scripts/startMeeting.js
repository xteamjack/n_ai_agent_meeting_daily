const axios = require("axios");
const { v4: uuidv4 } = require("uuid");

const BASE_URL = process.env.SERVER_URL || "http://localhost:3110";

async function startMeeting(name) {
    if (!name) {
        console.error("Please provide a meeting name: node src/cli.js <meeting-name>");
        process.exit(1);
    }

    const uniqueId = uuidv4().split("-")[0];
    const roomName = `${name}-${uniqueId}`;

    console.log(`🚀 Starting meeting session: ${roomName}...`);

    try {
        const response = await axios.post(`${BASE_URL}/daily/start-with-bot`, {
            roomName: roomName,
        });

        const { meetingId, roomUrl, botJoined } = response.data;

        console.log("\n✅ Meeting Session Started Successfully!");
        console.log("----------------------------------------");
        console.log(`🆔 Meeting ID:  ${meetingId}`);
        console.log(`🔗 Room URL:   ${roomUrl}`);
        console.log(`🤖 Bot Status: ${botJoined ? "Joined" : "Failed to join"}`);
        console.log("----------------------------------------\n");
        console.log("User can join now using the Room URL above.");
    } catch (error) {
        console.error("❌ Error starting meeting:", error.response?.data || error.message);
    }
}

const meetingName = process.argv[2];
startMeeting(meetingName);
