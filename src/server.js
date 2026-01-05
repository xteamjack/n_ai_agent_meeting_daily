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

const {
  endRoom,
  configureGlobalWebhook,
  getRecordingAccessLink,
} = require("./services/daily.service");

// app.post("/daily/webhook", (req, res) => {
//   console.log("🔥 DAILY WEBHOOK HIT");
//   console.log(JSON.stringify(req.body));
//   res.status(200).send("OK");
// });

/**
 * Daily recording webhook
 */
// app.post("/daily/webhook", async (req, res) => {
//   console.log(`📡 Webhook received: ${JSON.stringify(req.body)}`);
//   const { type, payload } = req.body;

//   if (type === "recording.ready-to-download") {
//     const meetingId = payload.room_name;
//     let downloadUrl = payload.download_url;

//     if (!downloadUrl && payload.recording_id) {
//       console.log(
//         `🔍 download_url missing in payload for ${meetingId}. Fetching access link...`
//       );
//       downloadUrl = await getRecordingAccessLink(payload.recording_id);
//     }

//     if (!downloadUrl) {
//       console.error(`❌ Could not obtain download_url for room: ${meetingId}`);
//       return res.sendStatus(400);
//     }

//     console.log(`🎬 Recording ready for room: ${meetingId}`);

//     try {
//       await saveRecording(downloadUrl, meetingId);

//       const transcript = generateTranscriptPlaceholder(meetingId);
//       saveTranscript(meetingId, transcript);

//       console.log(`✅ Recording saved. Deleting room: ${meetingId}`);
//       await endRoom(meetingId);
//     } catch (err) {
//       console.error(`❌ Error processing recording for ${meetingId}:`, err);
//     }
//   }

//   res.sendStatus(200);
// });

app.post("/daily/webhook", async (req, res) => {
  console.log("📡 Webhook received:", JSON.stringify(req.body));

  const { type, payload } = req.body;

  if (type !== "recording.ready-to-download") {
    return res.sendStatus(200);
  }

  const meetingId = payload.room_name;
  const recordingId = payload.recording_id;

  if (!recordingId) {
    console.error(`❌ Missing recording_id for room ${meetingId}`);
    return res.sendStatus(400);
  }

  try {
    // 🛑 Idempotency check (VERY IMPORTANT)
    if (await recordingAlreadyProcessed(recordingId)) {
      console.log(`🔁 Recording already processed: ${recordingId}`);
      return res.sendStatus(200);
    }

    console.log(`🎬 Recording ready for room: ${meetingId}`);

    // 1️⃣ Fetch download URL from Daily API
    const downloadUrl = await getRecordingAccessLink(recordingId);

    if (!downloadUrl) {
      throw new Error("download_url not returned by Daily API");
    }

    // 2️⃣ Save video
    await saveRecording(downloadUrl, meetingId);

    // 3️⃣ Generate transcript (placeholder or real)
    const transcript = generateTranscriptPlaceholder(meetingId);
    await saveTranscript(meetingId, transcript);

    // 4️⃣ Mark as processed
    await markRecordingProcessed(recordingId);

    console.log(`✅ Recording processed for ${meetingId}`);

    // 🟡 Optional cleanup (SAFE)
    // await scheduleRoomCleanup(meetingId);

  } catch (err) {
    console.error(`❌ Error processing recording for ${meetingId}:`, err);
    // Do NOT return non-200 → Daily will retry
    // Temp arrangement to make sure circuit breakers would not trip on webhook
    res.sendStatus(200);
  }

  // res.sendStatus(200);
});

async function recordingAlreadyProcessed(id) {
  return false; // replace with DB / file check
}

async function markRecordingProcessed(id) {
  return true;
}

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
  console.log(formatIST(new Date()));
  console.log(new Date().toISOString());

  // Ensure Daily.co webhook is configured
  // configureGlobalWebhook().catch(console.error);
});

function formatIST(dateInput) {
  const date = new Date(dateInput); // can be Date object, ISO string, or timestamp

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
