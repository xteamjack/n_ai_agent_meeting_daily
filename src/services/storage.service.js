const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function saveRecording(downloadUrl, meetingId) {
  const dirPath = path.join(__dirname, "../..", "recordings", meetingId);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, `recording_${Date.now()}.mp4`);

  console.log(`📥 Saving recording to ${filePath}`);

  const response = await axios.get(downloadUrl, { responseType: "stream" });
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", resolve);
    writer.on("error", reject);
  });
}

function saveTranscript(meetingId, transcript) {
  const filePath = path.join(
    __dirname,
    "../../storage/transcripts",
    `${meetingId}.json`
  );

  fs.writeFileSync(filePath, JSON.stringify(transcript, null, 2));
}

module.exports = {
  saveRecording,
  saveTranscript,
};
