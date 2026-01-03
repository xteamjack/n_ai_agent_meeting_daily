const fs = require("fs");
const axios = require("axios");

async function downloadAndStore(url) {
  const writer = fs.createWriteStream(`./storage/${Date.now()}.mp4`);
  const response = await axios.get(url, { responseType: "stream" });
  response.data.pipe(writer);
}

module.exports = { downloadAndStore };
