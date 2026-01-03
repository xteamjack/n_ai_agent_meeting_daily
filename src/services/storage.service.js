const fs = require("fs");
const path = require("path");
const axios = require("axios");

async function saveRecording(downloadUrl, meetingId) {
  const filePath = path.join(
    __dirname,
    "../../storage/recordings",
    `${meetingId}.mp4`
  );

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
