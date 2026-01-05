const fs = require("fs");
const path = require("path");
const axios = require("axios");
const crypto = require("crypto");

async function saveRecording(downloadUrl, meetingId) {
  console.log(meetingId, downloadUrl);
  const dirPath = path.join(__dirname, "../..", "recordings", meetingId);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, `recording_${Date.now()}.mp4`);
  const absolutePath = path.resolve(filePath);

  console.log(`📥 Downloading recording to: ${absolutePath}`);

  const response = await axios.get(downloadUrl, { responseType: "stream" });
  const writer = fs.createWriteStream(filePath);

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on("finish", () => {
      console.log(`✅ Recording saved successfully at ${absolutePath}`);
      resolve();
    });
    writer.on("error", (err) => {
      console.error(`❌ Error writing recording file: ${err.message}`);
      reject(err);
    });
  });
}

// function saveTranscript(meetingId, transcript) {
//   const filePath = path.join(
//     __dirname,
//     "../../storage/transcripts",
//     `${meetingId}.json`
//   );

//   fs.writeFileSync(filePath, JSON.stringify(transcript, null, 2));
// }



function saveTranscript(meetingId, transcript) {
  // Generate an 8-character unique ID
  const uniqueId = crypto.randomBytes(4).toString("hex");

  // Build folder path and file path
  const folderPath = path.join(__dirname, "../../recordings", meetingId);
  const filePath = path.join(
    folderPath,
    `transcript_${uniqueId}.json`
  );

  // Ensure the folder exists
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  // Save transcript
  fs.writeFileSync(filePath, JSON.stringify(transcript, null, 2));
}


module.exports = {
  saveRecording,
  saveTranscript,
};
