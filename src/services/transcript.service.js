function generateTranscriptPlaceholder(meetingId) {
  return {
    meetingId,
    transcript: [
      { speaker: "agent", text: "Hello, welcome to the meeting." },
      { speaker: "user", text: "Thanks." },
    ],
  };
}

module.exports = { generateTranscriptPlaceholder };
