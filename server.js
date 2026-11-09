// Beep Link server.
// Serves the phone page (/) and the big water screen (/screen), and relays voice messages
// to everyone in a group that shares a 4-character code.
// No accounts, no database: everything lives in memory while people are connected.

const path = require("path");
const http = require("http");
const express = require("express");
const { WebSocketServer } = require("ws");

const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.get("/healthz", (_req, res) => res.send("ok"));
app.get("/screen", (_req, res) => res.sendFile(path.join(__dirname, "public", "screen.html")));
app.get("/vendor/qrcode.js", (_req, res) => res.sendFile(path.join(__dirname, "node_modules", "qrcode-generator", "qrcode.js")));

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws", maxPayload: 4 * 1024 * 1024 });

const MAX_GROUP = 20;
const COLORS = 8;                 // the page has 8 person colours
const rooms = new Map();          // code -> Set<ws>
const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f]/g, "").trim().slice(0, n);
const send = (ws, msg) => { if (ws.readyState === 1) ws.send(JSON.stringify(msg)); };

function members(code) {
  return [...(rooms.get(code) || [])].map((c) => ({ id: c.id, name: c.name, color: c.color, kind: c.kind }));
}
function announce(code) {
  const list = members(code);
  for (const c of rooms.get(code) || []) send(c, { type: "members", you: c.id, members: list });
}
function leave(ws) {
  if (!ws.code) return;
  const set = rooms.get(ws.code);
  const code = ws.code;
  ws.code = null;
  if (set) { set.delete(ws); if (!set.size) rooms.delete(code); else announce(code); }
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
      if (!set.has(ws) && set.size >= MAX_GROUP) return send(ws, { type: "error", message: `That group is full (${MAX_GROUP} people).` });
      ws.kind = m.kind === "screen" ? "screen" : "person";   // a big screen listens and shows; it doesn't talk
      if (ws.code !== code) {
        leave(ws);
        const used = new Set([...set].map((c) => c.color));
        ws.color = ws.kind === "screen" ? null : ([...Array(COLORS).keys()].find((i) => !used.has(i)) ?? set.size % COLORS);
      }
      ws.code = code;
      ws.name = ws.kind === "screen" ? (clean(m.name, 16) || "Big screen") : (clean(m.name, 16) || "Someone");
      set.add(ws); rooms.set(code, set);
      send(ws, { type: "joined", code, you: ws.id });
      announce(code);
    }

    if (m.type === "profile" && ws.code) {
      ws.name = clean(m.name, 16) || ws.name;
      announce(ws.code);
    }

    if (m.type === "rec" && ws.code && ws.kind === "person") {
      // someone started or stopped recording: screens show where their message will land
      for (const c of rooms.get(ws.code) || []) if (c !== ws) send(c, { type: "rec", from: ws.id, name: ws.name, color: ws.color, on: !!m.on });
    }

    if (m.type === "voice" && ws.code && ws.kind === "person") {
      // a recorded message: 16 kHz mono WAV, base64, up to ~30 s
      if (typeof m.audio !== "string" || m.audio.length > 1400000 || !/^[A-Za-z0-9+/=]+$/.test(m.audio)) return;
      const now = Date.now();
      if (ws.lastVoice && now - ws.lastVoice < 800) return;
      ws.lastVoice = now;
      const dur = Math.max(0, Math.min(60, Number(m.dur) || 0));
      const out = { type: "voice", from: ws.id, name: ws.name, color: ws.color, dur, at: now, audio: m.audio };
      let people = 0, screens = 0;
      for (const c of rooms.get(ws.code) || []) if (c !== ws) { send(c, out); c.kind === "screen" ? screens++ : people++; }
      send(ws, { type: "sent", to: people, screens });
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
