const express = require("express");
const { PORT } = require("./config/env");
const meetingRoutes = require("./routes/meeting.routes");
const { saveRecording, saveTranscript } = require("./services/storage.service");
const {
  generateTranscriptPlaceholder,
} = require("./services/transcript.service");

const app = express();
app.use(express.json());

app.use(meetingRoutes);

/**
 * Daily recording webhook
 */
app.post("/webhook/daily", async (req, res) => {
  const payload = req.body.payload;

  const meetingId = payload.room_name;
  const downloadUrl = payload.download_url;

  await saveRecording(downloadUrl, meetingId);

  const transcript = generateTranscriptPlaceholder(meetingId);
  saveTranscript(meetingId, transcript);

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
