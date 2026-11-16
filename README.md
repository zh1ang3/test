# Beep Link

A group voice channel for phones (iPhone, Android, anything). Everyone opens one web
link and joins with a 4-character code. **Hold to talk**, let go, and everyone else in
the group hears it. The sound waves lie flat until a message is recorded or played,
then they move with the voice in the speaker's colour. No accounts, no app to install.

## The big water screen

Open **your Render address + `/screen`** (for example `https://beep-link-xxxx.onrender.com/screen`)
in Chrome or Edge on the big screen or laptop. To join a group that already exists, add its
code: `/screen#5npe`. Click the corner card to change the code, turn sound off, or go full screen.

- Black water with slow threads of coloured ink that the currents twist into marbling.
  Touch or drag to make ripples; they show as fine glowing contour lines.
- Someone recording on a phone: a breathing ring appears where their message will land.
- Message sent: a drop lands and their colour blooms into the water. It **doesn't play by
  itself**: it waits as a point of light with a slow heartbeat. Click it to play; rings pulse
  out with the voice. Click again any time to replay.
- Phones join by scanning the QR code in the corner.
- Needs Chrome or Edge on a reasonably modern computer.

## Put it online for free (about 10 minutes)

You need a free **GitHub** account and a free **Render** account.

### 1. Upload the files to GitHub
1. Sign in at github.com and click **New** (new repository).
2. Name it `beep-link` and click **Create repository**.
3. On the empty repo page, click **uploading an existing file**.
4. Unzip `beep-link-web.zip` and drag in everything inside the `beep-link-web` folder:
   `server.js`, `package.json`, `package-lock.json`, `README.md`, `.gitignore` and the `public` folder
   (it now holds `index.html` for phones and `screen.html` for the big screen).
5. Click **Commit changes**.

Already set up from an earlier version? Upload the new `server.js`, `package.json`,
`package-lock.json` and `public` folder over the old ones. Render updates by itself.

### 2. Run it on Render
1. Sign in at render.com with GitHub.
2. Click **New +** → **Web Service** and pick your `beep-link` repository.
3. Runtime **Node** · Build command `npm install` · Start command `npm start` · Instance type **Free**.
4. Click **Create Web Service** and wait for **Live**.
5. Your link is right under the service name at the top, like `https://beep-link-xxxx.onrender.com`.

### 3. Use it
1. One person opens the link, types a name and taps **New group**.
2. They tap the code in the corner, then **Copy invite link**, and send it to everyone.
   (Or people open the link, type a name, enter the code and tap **Join**.)
3. Press and hold **Hold to talk**, speak, and let go. The first time, allow the microphone.
4. Everyone else hears it right away. New messages play one after another, oldest first.
   Tap any message in the list to hear it again.

Tip: "Add to Home Screen" (Safari share menu / Chrome menu) makes it open full-screen like an app.

## Good to know

- **Up to 20 people** per group. Each person gets their own colour.
- **Keep the page open on screen.** A web page can't play sounds while the phone is
  locked or the browser is in the background. Messages sent while someone's page is
  closed don't reach them; nothing is saved on the server.
- **Messages are up to 30 seconds.**
- **iPhone:** newer iPhones play messages even with silent mode on; on older ones, turn
  silent mode off.
- **Free Render servers sleep** after about 15 minutes with no visitors. The first
  visit after that takes up to a minute to load.
- **The microphone needs the https link** (your Render address).

## Run it on your own computer instead

```bash
npm install
npm start
```
Then open `http://localhost:3000`. (Phones need the https Render link for the microphone.)
