const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT =
  "C:\\Users\\ALG\\AppData\\Local\\Temp\\chatbox-sandbox\\2e464165-3f14-424e-bf50-f2c4cffe3024\\outv3.txt";
fs.writeFileSync(OUT, "");
function log(...a) { fs.appendFileSync(OUT, a.join(" ") + "\n"); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errs = [];
  page.on("pageerror", (e) => errs.push("[pageerror] " + e.message));

  await page.goto("http://localhost:5173", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2500));

  // Click "Play Top Hits" hero button
  const played = await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      (x.innerText || "").includes("Play Top Hits")
    );
    if (b) { b.click(); return true; }
    return false;
  });
  await new Promise((r) => setTimeout(r, 3000));
  log("PLAYED: " + played);

  // Open Now Playing via mini-player cover/thumbnail
  const opened = await page.evaluate(() => {
    const ex = [...document.querySelectorAll("button")].find((b) => (b.innerHTML||"").includes("lucide-maximize"));
    if (ex) { ex.click(); return true; }
    return false;
  });
  await new Promise((r) => setTimeout(r, 1500));
  log("NOWPLAYING_OPEN: " + opened);

  // Check timer button + click + options
  const timer = await page.evaluate(() => {
    const t = [...document.querySelectorAll("button")].find((b) => (b.innerHTML||"").includes("lucide-timer"));
    if (!t) return "NO_TIMER_BTN";
    t.click();
    return "TIMER_FOUND";
  });
  await new Promise((r) => setTimeout(r, 600));
  const opts = await page.evaluate(() => {
    const m = [...document.querySelectorAll("button")].filter((b) => /^\d+ min$/.test((b.innerText||"").trim()));
    const off = [...document.querySelectorAll("button")].some((b) => (b.innerText||"").includes("Turn off"));
    return "OPTIONS:" + m.length + " offBtn:" + off;
  });
  log("TEST5 " + timer + " " + opts);

  // Check lyrics button
  const lyric = await page.evaluate(() => {
    const m = [...document.querySelectorAll("button")].find((b) => (b.innerHTML||"").includes("lucide-mic"));
    if (!m) return "NO_MIC";
    m.click();
    return "MIC_FOUND";
  });
  await new Promise((r) => setTimeout(r, 4000));
  const lyricState = await page.evaluate(() => {
    const t = document.body.innerText || "";
    // look for timestamp-like or lyric lines
    const hasLines = t.split("\n").filter((l) => l.trim().length > 10).length;
    return "TEXT_LINES:" + hasLines + " sample:" + t.slice(0, 80).replace(/\n/g, " ");
  });
  log("TEST2 " + lyric + " " + lyricState);

  // Close now playing, test mood click on home
  await page.evaluate(() => {
    const x = [...document.querySelectorAll("button")].find((b) => (b.innerHTML||"").includes("lucide-x"));
    x && x.click();
  });
  await new Promise((r) => setTimeout(r, 800));
  await page.evaluate(() => {
    const h = [...document.querySelectorAll("button")].find((b) => (b.innerText||"").trim() === "Home");
    h && h.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const mood = await page.evaluate(() => {
    const m = [...document.querySelectorAll("button")].find((b) =>
      ["Happy","Chill","Workout","Focus","Romance","Party","Sad","Sleep","Throwback","Feeling","Indonesia","Top 50"].some(w => (b.innerText||"").includes(w))
    );
    if (!m) return "NO_MOOD";
    m.click();
    return "MOOD_CLICKED:" + m.innerText.trim();
  });
  await new Promise((r) => setTimeout(r, 2500));
  const moodAfter = await page.evaluate(() => ({
    len: document.getElementById("root").innerHTML.length,
    hasResults: (document.body.innerText||"").includes("Songs") || (document.body.innerText||"").includes("Artists"),
  }));
  log("TEST3 " + mood + " afterLen=" + moodAfter.len + " results=" + moodAfter.hasResults);

  log("ERRORS: " + (errs.join(" | ") || "(none)"));
  await browser.close();
  log("DONE");
})().catch((e) => log("FATAL " + e.message));
