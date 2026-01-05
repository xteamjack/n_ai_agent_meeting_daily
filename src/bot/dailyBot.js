const wrtc = require("wrtc");

// Set up globals for Daily to work in Node
global.RTCPeerConnection = wrtc.RTCPeerConnection;
global.RTCSessionDescription = wrtc.RTCSessionDescription;
global.RTCIceCandidate = wrtc.RTCIceCandidate;
global.RTCDataChannel = wrtc.RTCDataChannel;
global.RTCRtpReceiver = wrtc.RTCRtpReceiver;
global.RTCRtpSender = wrtc.RTCRtpSender;
global.RTCRtpTransceiver = wrtc.RTCRtpTransceiver;
global.MediaStream = wrtc.MediaStream;
global.MediaStreamTrack = wrtc.MediaStreamTrack;

global.navigator = {
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  platform: "Win32",
  appVersion: "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  mediaDevices: {
    enumerateDevices: async () => [],
    getUserMedia: async () => {
      const stream = new wrtc.MediaStream();
      // Polyfill methods if wrtc implementation is incomplete
      if (!stream.getTracks) stream.getTracks = () => [];
      if (!stream.getVideoTracks) stream.getVideoTracks = () => [];
      if (!stream.getAudioTracks) stream.getAudioTracks = () => [];
      return stream;
    },
  },
  permissions: {
    query: async () => ({ state: "granted" }),
  },
};

global.window = global;
global.self = global;
global.innerWidth = 1920;
global.innerHeight = 1080;
global.location = {
  href: "https://localhost",
  protocol: "https:",
  host: "localhost",
  hostname: "localhost",
  port: "",
  pathname: "/",
  search: "",
  hash: "",
  origin: "https://localhost",
};

global.HTMLVideoElement = class { };
global.HTMLAudioElement = class { };
global.HTMLCanvasElement = class { };
global.HTMLAnchorElement = class { };
global.HTMLImageElement = class { };
global.Node = class { };
global.Element = class { };
global.HTMLElement = class { };

global.matchMedia = () => ({
  matches: false,
  addListener: () => { },
  removeListener: () => { },
});

// Event polyfills
const listeners = new Map();
global.addEventListener = (type, listener) => {
  if (!listeners.has(type)) listeners.set(type, new Set());
  listeners.get(type).add(listener);
};
global.removeEventListener = (type, listener) => {
  if (listeners.has(type)) listeners.get(type).delete(listener);
};
global.dispatchEvent = (event) => {
  const type = event.type || event;
  if (listeners.has(type)) {
    listeners.get(type).forEach((listener) => {
      if (typeof listener === "function") {
        listener(event);
      } else if (listener && typeof listener.handleEvent === "function") {
        listener.handleEvent(event);
      }
    });
  }
  return true;
};

global.document = {
  readyState: "complete",
  createElement: (tag) => {
    const el = {
      tagName: tag.toUpperCase(),
      style: {},
      _listeners: {},
      appendChild: (child) => {
        if (child) child.parentElement = el;
        return child;
      },
      append: (...args) => { },
      addEventListener: (type, cb) => {
        el._listeners[type] = el._listeners[type] || [];
        el._listeners[type].push(cb);
      },
      removeEventListener: (type, cb) => {
        if (el._listeners[type]) {
          el._listeners[type] = el._listeners[type].filter((l) => l !== cb);
        }
      },
      setAttribute: (name, val) => {
        el[name] = val;
        if (name === "src" && el.tagName === "SCRIPT") {
          setTimeout(() => {
            if (el._listeners["load"]) {
              el._listeners["load"].forEach((cb) => cb({ type: "load", target: el }));
            }
          }, 50);
        }
      },
      getAttribute: (name) => el[name],
    };
    return el;
  },
  createElementNS: (ns, tag) => {
    const el = global.document.createElement(tag);
    el.namespaceURI = ns;
    return el;
  },
  createTextNode: (text) => ({ text }),
  getElementsByTagName: (tag) => {
    const t = tag.toLowerCase();
    if (t === "head") return [global.document.head];
    if (t === "body") return [global.document.body];
    return [];
  },
  body: {
    appendChild: (child) => { if (child) child.parentElement = global.document.body; return child; },
    removeChild: () => { },
    append: () => { },
  },
  head: {
    appendChild: (child) => { if (child) child.parentElement = global.document.head; return child; },
    removeChild: () => { },
    append: () => { },
  },
  documentElement: {
    scrollLeft: 0,
    scrollTop: 0,
    clientWidth: 1920,
    clientHeight: 1080,
  },
  addEventListener: global.addEventListener,
  removeEventListener: global.removeEventListener,
  dispatchEvent: global.dispatchEvent,
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
};

// Add standard browser events/constructors if missing
global.MessageChannel = require("worker_threads").MessageChannel || class { };
global.Blob = class { };
global.Event = class { constructor(type) { this.type = type; } };
global.CustomEvent = class extends global.Event {
  constructor(type, detail) {
    super(type);
    this.detail = detail;
  }
};
global.Image = class { };
global.Audio = class { };

global.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 16);
global.cancelAnimationFrame = (id) => clearTimeout(id);

global.postMessage = (message, targetOrigin) => {
  setTimeout(() => {
    global.dispatchEvent({ type: "message", data: message, origin: targetOrigin || "*" });
  }, 0);
};

global.localStorage = {
  getItem: () => null,
  setItem: () => { },
  removeItem: () => { },
  clear: () => { },
};
global.sessionStorage = global.localStorage;

global.atob = (str) => Buffer.from(str, "base64").toString("binary");
global.btoa = (str) => Buffer.from(str, "binary").toString("base64");

global.WebSocket = require("ws");
global.fetch = global.fetch || (async (url, options = {}) => {
  const axios = require("axios");
  try {
    const res = await axios({
      method: options.method || "GET",
      url: url,
      data: options.body,
      headers: options.headers,
    });
    return {
      ok: true,
      status: res.status,
      json: async () => res.data,
      text: async () => (typeof res.data === "string" ? res.data : JSON.stringify(res.data)),
    };
  } catch (err) {
    return {
      ok: false,
      status: err.response?.status || 500,
      json: async () => err.response?.data,
      text: async () => JSON.stringify(err.response?.data),
    };
  }
});
global.screen = { width: 1920, height: 1080 };

const Daily = require("@daily-co/daily-js");
const { registerBot } = require("./botRegistry");

async function startBot({ meetingId, roomUrl, token }) {
  console.log(`🤖 Starting bot for meeting: ${meetingId}`);
  console.log(`🔗 Room URL: ${roomUrl}`);

  console.log("🔍 Checking Daily support:", Daily.supportedBrowser());

  const call = Daily.createCallObject({
    subscribeToTracksAutomatically: false,
  });

  console.log("📞 Call object created");

  call.on("connecting", () => {
    console.log(`🔌 Bot is connecting to meeting ${meetingId}...`);
  });

  call.on("connected", () => {
    console.log(`🔗 Bot is connected to meeting ${meetingId}.`);
  });

  call.on("joining-meeting", () => {
    console.log(`⌛ Bot is joining meeting ${meetingId}...`);
  });

  let heartbeatInterval;
  let humanParticipants = 0;

  call.on("joined-meeting", (evt) => {
    console.log(`✅ Bot joined meeting ${meetingId}`);

    // Check if anyone is already in the room
    const participants = call.participants();
    humanParticipants = Object.values(participants).filter(p => !p.local).length;

    console.log(`👥 Current human participants: ${humanParticipants}`);

    if (humanParticipants > 0) {
      console.log("⏺️ Human(s) already present. Starting recording...");
      call.startRecording();
    }
  });

  call.on("recording-started", () => {
    console.log("🔴 Recording started!");
  });

  call.on("recording-stopped", () => {
    console.log("⏹️ Recording stopped. Bot leaving...");
    call.leave().catch(console.error);
  });

  call.on("participant-joined", (evt) => {
    if (evt.participant.local) return; // Skip the bot itself

    humanParticipants++;
    console.log(`👤 Participant joined: ${evt.participant.user_name || evt.participant.session_id} (Total Humans: ${humanParticipants})`);

    if (humanParticipants === 1) {
      console.log("⏺️ First human joined. Starting recording...");
      call.startRecording();
    }
  });

  call.on("participant-left", (evt) => {
    if (evt.participant.local) return;

    humanParticipants = Math.max(0, humanParticipants - 1);
    console.log(`👋 Participant left: ${evt.participant.user_name || evt.participant.session_id} (Total Humans: ${humanParticipants})`);

    if (humanParticipants === 0) {
      console.log("⏹️ Last human left. Stopping recording...");
      call.stopRecording();
    }
  });

  call.on("left-meeting", () => {
    console.log(`🚪 Bot left meeting ${meetingId}`);
    if (heartbeatInterval) {
      clearInterval(heartbeatInterval);
      console.log(`🛑 Heartbeat stopped for ${meetingId}`);
    }
  });

  call.on("error", (err) => {
    console.error("❌ Bot error:", err);
  });

  call.on("nonfatal-error", (err) => {
    console.warn("⚠️ Non-fatal bot error:", err);
  });

  try {
    console.log("🚀 Attempting to join meeting...");
    const timeout = setTimeout(() => {
      console.log("⏰ Joining meeting is taking a long time (30s+)... still waiting.");
    }, 30000);

    await call.join({
      url: roomUrl,
      token,
      userName: "AI Agent",
    });
    clearTimeout(timeout);
    console.log("🏁 call.join() call finished");
  } catch (err) {
    console.error("FAILED to join meeting:", err);
  }

  heartbeatInterval = setInterval(() => {
    console.log(`💓 Bot heartbeat for ${meetingId}`);
  }, 5000);

  // 🔴 CRITICAL: keep reference
  registerBot(meetingId, call);
}

module.exports = { startBot };
