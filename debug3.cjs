const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT =
  "C:\\Users\\ALG\\AppData\\Local\\Temp\\chatbox-sandbox\\2e464165-3f14-424e-bf50-f2c4cffe3024\\out3.txt";
fs.writeFileSync(OUT, "START\n");
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
  const logs = [];
  page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

  await page.goto("http://localhost:5173", {
    waitUntil: "networkidle2",
    timeout: 25000,
  });
  await new Promise((r) => setTimeout(r, 2000));

  const input = await page.$('input[placeholder*="Search"]');
  await input.click();
  await input.type("ariana", { delay: 40 });
  await new Promise((r) => setTimeout(r, 1800));

  // Cari item di dropdown: button yang punya img thumbnail kecil
  const items = await page.$$("button");
  let clicked = false;
  for (const b of items) {
    try {
      const info = await page.evaluate((el) => {
        const imgs = el.querySelectorAll("img").length;
        const txt = el.innerText || "";
        const hasMusicIcon = el.innerHTML.includes("lucide-music");
        return { imgs, txt: txt.slice(0, 30), hasMusicIcon };
      }, b);
      // item lagu dropdown: ada img + teks pendek (judul - artist)
      if (info.imgs >= 1 && info.txt.length > 0 && info.txt.length < 60) {
        await b.click();
        clicked = true;
        log("CLICKED: " + info.txt);
        break;
      }
    } catch (e) {}
  }
  if (!clicked) log("NO_ITEM_CLICKED");

  await new Promise((r) => setTimeout(r, 3500));

  const info = await page.evaluate(() => {
    const r = document.getElementById("root");
    return { rootLen: r ? r.innerHTML.length : -1 };
  });
  log("AFTER rootLen=" + info.rootLen);
  log("LOGS:\n" + (logs.join("\n") || "(none)"));
  try {
    await page.screenshot({
      path: "C:\\Users\\ALG\\AppData\\Local\\Temp\\chatbox-sandbox\\2e464165-3f14-424e-bf50-f2c4cffe3024\\shot3.png",
    });
    log("SHOT_OK");
  } catch (e) {
    log("SHOT_ERR " + e.message);
  }
  await browser.close();
  log("DONE");
})().catch((e) => log("FATAL " + e.message + "\n" + e.stack));
