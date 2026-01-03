const Daily = require("@daily-co/daily-js");

async function joinRoom(roomUrl, token) {
  const call = Daily.createCallObject();

  await call.join({
    url: roomUrl,
    token,
  });

  console.log("Bot joined room");

  return call;
}

module.exports = { joinRoom };
