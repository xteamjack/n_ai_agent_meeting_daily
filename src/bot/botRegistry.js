const bots = new Map();

/**
 * Store active bot instances
 */
function registerBot(meetingId, callObject) {
  bots.set(meetingId, callObject);
}

/**
 * Stop and remove bot
 */
async function stopBot(meetingId) {
  const bot = bots.get(meetingId);
  if (bot) {
    await bot.leave();
    bots.delete(meetingId);
    console.log(`🤖 Bot left meeting ${meetingId}`);
  }
}

module.exports = { registerBot, stopBot };
