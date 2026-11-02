// Beep Link — standalone web server.
// Serves the page and relays voice messages between phones that share a 4-character code.
// No accounts, no database: everything lives in memory while people are connected.

const path = require("path");
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
// serve the 3D library from our own server so the page works without outside CDNs
app.use("/three", express.static(path.join(__dirname, "node_modules", "three")));
app.get("/healthz", (_req, res) => res.send("ok"));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 4 * 1024 * 1024 });

const SOUNDS = ["chirp", "ding", "buzz", "boing", "siren"];
const rooms = new Map(); // code -> Set<ws>
const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, n);

function send(ws, msg) { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); }

function peersOf(code) {
  return [...(rooms.get(code) || [])].map((c) => ({ id: c.id, name: c.name, sound: c.sound }));
}
function announce(code) {
  const peers = peersOf(code);
  for (const c of rooms.get(code) || []) send(c, { type: "peers", peers: peers.filter((p) => p.id !== c.id) });
}
function leave(ws) {
  if (!ws.code) return;
  const set = rooms.get(ws.code);
  if (set) { set.delete(ws); if (!set.size) rooms.delete(ws.code); else announce(ws.code); }
  ws.code = null;
}

let nextId = 1;
wss.on("connection", (ws) => {
  ws.id = String(nextId++);
  ws.isAlive = true;
  ws.on("pong", () => (ws.isAlive = true));

  ws.on("message", (raw) => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    if (!m || typeof m !== "object") return;

    if (m.type === "join") {
      const code = clean(m.code, 4).toLowerCase();
      if (!/^[a-z0-9]{4}$/.test(code)) return send(ws, { type: "error", message: "Codes are 4 characters." });
      const set = rooms.get(code) || new Set();
      if (!set.has(ws) && set.size >= 8) return send(ws, { type: "error", message: "That code is full." });
      leave(ws);
      ws.code = code;
      ws.name = clean(m.name, 16) || "Phone";
      ws.sound = SOUNDS.includes(m.sound) ? m.sound : "ding";
      set.add(ws); rooms.set(code, set);
      send(ws, { type: "joined", code });
      announce(code);
    }

    if (m.type === "profile" && ws.code) {
      ws.name = clean(m.name, 16) || ws.name;
      if (SOUNDS.includes(m.sound)) ws.sound = m.sound;
      announce(ws.code);
    }

    if (m.type === "beep" && ws.code) {
      const now = Date.now();
      if (ws.lastBeep && now - ws.lastBeep < 300) return; // light flood guard
      ws.lastBeep = now;
      for (const c of rooms.get(ws.code) || []) {
        if (c !== ws) send(c, { type: "beep", from: ws.id, name: ws.name, sound: ws.sound });
      }
      send(ws, { type: "sent" });
    }

    if (m.type === "voice" && ws.code) {
      // a recorded message: 16 kHz mono WAV, base64, up to ~30 s
      if (typeof m.audio !== "string" || m.audio.length > 1400000 || !/^[A-Za-z0-9+/=]+$/.test(m.audio)) return;
      const now = Date.now();
      if (ws.lastVoice && now - ws.lastVoice < 800) return;
      ws.lastVoice = now;
      const dur = Math.max(0, Math.min(60, Number(m.dur) || 0));
      for (const c of rooms.get(ws.code) || []) {
        if (c !== ws) send(c, { type: "voice", from: ws.id, name: ws.name, dur, audio: m.audio });
      }
      send(ws, { type: "sent" });
    }

    if (m.type === "leave") leave(ws);
  });

  ws.on("close", () => leave(ws));
});

// drop dead connections (phones that went to sleep without closing)
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 25000);

const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Beep Link running on http://localhost:${port}`));
