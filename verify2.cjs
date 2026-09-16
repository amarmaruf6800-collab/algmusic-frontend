const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT =
  "C:\\Users\\ALG\\AppData\\Local\\Temp\\chatbox-sandbox\\2e464165-3f14-424e-bf50-f2c4cffe3024\\outv2.txt";
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

  await page.goto("http://localhost:5173", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2500));

  // TEST1: dropdown click (no Enter)
  const input = await page.$('input[placeholder*="Search"]');
  await input.click();
  await input.type("weeknd", { delay: 30 });
  await new Promise((r) => setTimeout(r, 2000));
  const c1 = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button[type="button"]')].find(
      (x) => x.querySelector("img") && (x.innerText || "").trim().length
    );
    if (b) { b.click(); return b.innerText.slice(0, 25); }
    return "NONE";
  });
  await new Promise((r) => setTimeout(r, 2500));
  const a1 = await page.evaluate(() => document.getElementById("root").innerHTML.length);
  log("TEST1 click='" + c1 + "' rootLen=" + a1 + (a1 > 1000 ? " OK" : " BLANK"));

  // TEST3: moods - go home then click a mood
  await page.evaluate(() => {
    const h = [...document.querySelectorAll("button")].find((b) => (b.innerText||"").trim() === "Home");
    h && h.click();
  });
  await new Promise((r) => setTimeout(r, 1200));
  const c3 = await page.evaluate(() => {
    const m = [...document.querySelectorAll("button")].find((b) =>
      ["Happy","Chill","Workout","Focus","Romance","Party","Sad","Sleep","Throwback","Feeling","Indonesia","Top"].some(w => (b.innerText||"").includes(w))
    );
    if (!m) return "NO_MOOD";
    const t = m.innerText.trim();
    m.click();
    return "CLICKED:" + t;
  });
  await new Promise((r) => setTimeout(r, 2500));
  const a3 = await page.evaluate(() => document.getElementById("root").innerHTML.length);
  log("TEST3 " + c3 + " rootLen=" + a3);

  // TEST5: timer button exists
  // open now playing
  await page.evaluate(() => {
    const ex = [...document.querySelectorAll("button")].find((b) => (b.innerHTML||"").includes("lucide-maximize"));
    ex && ex.click();
  });
  await new Promise((r) => setTimeout(r, 1000));
  const c5 = await page.evaluate(() => {
    const t = [...document.querySelectorAll("button")].find((b) => (b.innerHTML||"").includes("lucide-timer"));
    if (!t) return "NO_TIMER";
    t.click();
    return "TIMER_BTN_FOUND";
  });
  await new Promise((r) => setTimeout(r, 800));
  const c5b = await page.evaluate(() => {
    const menu = [...document.querySelectorAll("button")].filter((b) => /^\d+ min$/.test((b.innerText||"").trim()));
    return "OPTIONS:" + menu.length;
  });
  log("TEST5 " + c5 + " " + c5b);

  log("ERRORS: " + (errs.join(" | ") || "(none)"));
  await browser.close();
  log("DONE");
})().catch((e) => log("FATAL " + e.message));
