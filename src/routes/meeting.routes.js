const express = require("express");
const {
  createRoom,
  createMeetingToken,
  endRoom,
} = require("../services/daily.service");

const { startBot } = require("../bot/dailyBot");
const { registerBot, stopBot } = require("../bot/botRegistry");

const router = express.Router();

/**
 * Start meeting
 */
router.post("/daily/start", async (req, res) => {
  const room = await createRoom();
  const token = await createMeetingToken(room.name);

  res.json({
    meetingId: room.name,
    roomUrl: room.url,
    botToken: token,
  });
});

/**
 * End meeting
 */
router.post("/daily/end", async (req, res) => {
  const { meetingId } = req.body;

  await stopBot(meetingId);
  await endRoom(meetingId);
  res.json({ status: "meeting ended" });
});

router.get("/daily/health", async (req, res) => {
  res.json({ status: "heathy" });
});

/**
 * Start meeting WITH bot
 */
router.post("/daily/start-with-bot", async (req, res) => {
  const room = await createRoom();
  const token = await createMeetingToken(room.name);

  startBot({
    meetingId: room.name,
    roomUrl: room.url,
    token,
  }).catch(console.error);

  res.json({
    meetingId: room.name,
    roomUrl: room.url,
    botJoined: true,
  });
});

module.exports = router;
