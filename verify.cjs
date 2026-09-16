const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT =
  "C:\\Users\\ALG\\AppData\\Local\\Temp\\chatbox-sandbox\\2e464165-3f14-424e-bf50-f2c4cffe3024\\outv.txt";
fs.writeFileSync(OUT, "");
function log(...a) {
  fs.appendFileSync(OUT, a.join(" ") + "\n");
}

(async () => {
  const browser = await puppeteer.launch({
    executablePath:
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  const errs = [];
  page.on("pageerror", (e) => errs.push("[pageerror] " + e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errs.push("[console.error] " + m.text());
  });

  await page.goto("http://localhost:5173", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2500));

  // ---- TEST 1: click dropdown song (no Enter) ----
  const input = await page.$('input[placeholder*="Search"]');
  await input.click();
  await input.type("ariana", { delay: 35 });
  await new Promise((r) => setTimeout(r, 2000));
  const click1 = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[type="button"]')];
    for (const b of btns) {
      if (b.querySelector("img") && (b.innerText || "").trim().length > 0) {
        b.click();
        return b.innerText.slice(0, 30);
      }
    }
    return "NONE";
  });
  await new Promise((r) => setTimeout(r, 3000));
  const after1 = await page.evaluate(() => ({
    rootLen: document.getElementById("root").innerHTML.length,
    hasPlayer: !!document.querySelector('[class*="fixed inset-x-0 bottom-0"]'),
  }));
  log("TEST1 dropdown click: " + click1);
  log("TEST1 after: " + JSON.stringify(after1));

  // ---- TEST 3: moods clickable ----
  // go home
  await page.evaluate(() => {
    const home = [...document.querySelectorAll("button")].find((b) =>
      (b.innerText || "").includes("Home")
    );
    home && home.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const moodTest = await page.evaluate(() => {
    const moods = [...document.querySelectorAll("button")].filter((b) =>
      ["Happy", "Chill", "Workout", "Focus", "Romance", "Party", "Sad", "Sleep"].includes(
        (b.innerText || "").trim()
      )
    );
    if (!moods.length) return "NO_MOODS";
    const before = location.href;
    moods[0].click();
    return "CLICKED:" + moods[0].innerText.trim() + " before=" + before;
  });
  await new Promise((r) => setTimeout(r, 2500));
  log("TEST3 moods: " + moodTest);
  log("TEST3 after len: " + (await page.evaluate(() => document.getElementById("root").innerHTML.length)));

  // ---- TEST 2: lyrics ----
  // play a song then open now playing, lyrics
  const playTest = await page.evaluate(() => {
    const btns = [...document.querySelectorAll("button")];
    for (const b of btns) {
      const h = b.innerHTML || "";
      if (h.includes("lucide-play") && (b.className || "").includes("btn-accent")) {
        b.click();
        return true;
      }
    }
    return false;
  });
  await new Promise((r) => setTimeout(r, 3000));
  // open now playing
  await page.evaluate(() => {
    const expand = [...document.querySelectorAll("button")].find((b) =>
      (b.innerHTML || "").includes("lucide-maximize")
    );
    expand && expand.click();
  });
  await new Promise((r) => setTimeout(r, 1500));
  const lyricTest = await page.evaluate(() => {
    const mic = [...document.querySelectorAll("button")].find((b) =>
      (b.innerHTML || "").includes("lucide-mic")
    );
    mic && mic.click();
    return mic ? "CLICKED_MIC" : "NO_MIC";
  });
  await new Promise((r) => setTimeout(r, 3500));
  const lyricState = await page.evaluate(() => {
    const t = document.body.innerText || "";
    return {
      hasLyricText: t.includes("lyric") || t.split("\n").some((l) => l.length > 15),
      sample: t.slice(0, 120),
    };
  });
  log("TEST2 play: " + playTest + " mic: " + lyricTest);
  log("TEST2 lyricState: " + JSON.stringify(lyricState));

  // ---- TEST 5: sleep timer present ----
  const timerTest = await page.evaluate(() => {
    const t = [...document.querySelectorAll("button")].find((b) =>
      (b.innerHTML || "").includes("lucide-timer")
    );
    return t ? "TIMER_BTN_FOUND" : "NO_TIMER_BTN";
  });
  log("TEST5 timer: " + timerTest);

  log("=== ERRORS ===");
  log(errs.join("\n") || "(none)");
  await browser.close();
  log("DONE");
})().catch((e) => log("FATAL " + e.message));
