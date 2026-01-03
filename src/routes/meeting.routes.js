const express = require("express");
const {
  createRoom,
  createMeetingToken,
  endRoom,
} = require("../services/daily.service");

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
  await endRoom(meetingId);
  res.json({ status: "meeting ended" });
});

router.get("/daily/health", async (req, res) => {
  res.json({ status: "heathy" });
});

module.exports = router;
