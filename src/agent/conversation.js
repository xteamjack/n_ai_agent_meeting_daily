const messages = [];

function addUserMessage(text) {
  messages.push({ role: "user", content: text });
}

function addAgentMessage(text) {
  messages.push({ role: "assistant", content: text });
}

module.exports = { messages, addUserMessage, addAgentMessage };
