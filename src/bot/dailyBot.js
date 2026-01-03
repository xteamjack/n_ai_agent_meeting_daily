// const Daily = require("@daily-co/daily-js");
// const Daily = require("@daily-co/daily-js/node");
const Daily = require("@daily-co/daily-js/dist/node");

require("wrtc");
const { registerBot } = require("./botRegistry");

async function startBot({ meetingId, roomUrl, token }) {
  const call = Daily.createCallObject({
    subscribeToTracksAutomatically: false,
  });

  call.on("joined-meeting", () => {
    console.log(`🤖 Bot joined meeting ${meetingId}`);
  });

  call.on("left-meeting", () => {
    console.log(`🤖 Bot left meeting ${meetingId}`);
  });

  call.on("error", (err) => {
    console.error("Bot error:", err);
  });

  await call.join({
    url: roomUrl,
    token,
    userName: "AI Agent",
  });

  setInterval(() => {
    console.log(`Bot heartbeat for ${meetingId}`);
  }, 5000);

  // 🔴 CRITICAL: keep reference
  registerBot(meetingId, call);
}

module.exports = { startBot };
