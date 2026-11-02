# Beep Link

Open one web link on two phones (iPhone, Android, anything), pair them with a
4-character code, then **hold to talk**: let go and the other phone plays your voice
message while the glass spiral spins and glows with your voice. No accounts, no app to install.

## Put it online for free (about 10 minutes)

You need a free **GitHub** account and a free **Render** account.

### 1. Upload the files to GitHub
1. Sign in at github.com and click **New** (new repository).
2. Name it `beep-link`, keep it **Public** or **Private**, and click **Create repository**.
3. On the empty repo page, click **uploading an existing file**.
4. Unzip `beep-link-web.zip` on your computer and drag in everything inside the
   `beep-link-web` folder: `server.js`, `package.json`, `README.md`, `.gitignore`
   and the `public` folder.
5. Click **Commit changes**.

### 2. Run it on Render
1. Sign in at render.com (you can sign in with GitHub).
2. Click **New +** → **Web Service** and pick your `beep-link` repository.
3. Fill in:
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
4. Click **Create Web Service** and wait for "Live" (a couple of minutes).
5. Your link is shown at the top, like `https://beep-link-xxxx.onrender.com`.

### 3. Use it
1. Open that link on both phones.
2. Phone 1: type a name, tap **New code**.
3. Phone 2: type a name, enter the code, tap **Join**.
4. When the corner shows the other person's name, press and hold **Hold to talk**, speak,
   and let go. The first time, the phone asks to use the microphone: allow it.
5. The other phone plays the message right away. Tap the message bubble to hear it again.

Tip: "Add to Home Screen" (Safari share menu / Chrome menu) makes it open full-screen like an app.

## Good to know

- **Keep the page open on screen.** A web page can't play sounds while the phone is
  locked or the browser is in the background.
- **iPhone:** newer iPhones play messages even with silent mode on; on older ones, turn
  silent mode off. iPhones can't vibrate from a web page.
- **Free Render servers sleep** after about 15 minutes with no visitors. The first
  visit after that takes up to a minute to load; after that it's instant.
- **Messages are up to 30 seconds** and aren't saved anywhere: if the other phone
  doesn't have Beep Link open, the message is lost.
- **The microphone needs the https link** (your Render address), not a local address.

## Run it on your own computer instead

```bash
npm install
npm start
```
Then open `http://<your-computer's-local-IP>:3000` on phones on the same Wi-Fi.
