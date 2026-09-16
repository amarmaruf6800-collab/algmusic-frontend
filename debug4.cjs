const puppeteer = require("puppeteer-core");
const fs = require("fs");
const OUT =
  "C:\\Users\\ALG\\AppData\\Local\\Temp\\chatbox-sandbox\\2e464165-3f14-424e-bf50-f2c4cffe3024\\out4.txt";
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
  page.on("pageerror", (e) => log("[pageerror] " + e.message));

  await page.goto("http://localhost:5173", { waitUntil: "networkidle2" });
  await new Promise((r) => setTimeout(r, 2000));

  const input = await page.$('input[placeholder*="Search"]');
  await input.click();
  await input.type("ariana", { delay: 40 });
  await new Promise((r) => setTimeout(r, 2500));

  // Dump dropdown HTML
  const drop = await page.evaluate(() => {
    const els = [...document.querySelectorAll("div")].filter((d) =>
      (d.className || "").includes("glass") && d.querySelector('button[type="button"]')
    );
    if (!els.length) return "NO_DROPDOWN";
    return els[0].outerHTML.slice(0, 1500);
  });
  log("DROPDOWN_HTML:\n" + drop);

  // Coba klik item pertama dengan img
  const clicked = await page.evaluate(() => {
    const btns = [...document.querySelectorAll('button[type="button"]')];
    for (const b of btns) {
      if (b.querySelector("img") && (b.innerText || "").trim().length > 0) {
        b.click();
        return b.innerText.slice(0, 40);
      }
    }
    return "NONE";
  });
  log("CLICK_RESULT: " + clicked);
  await new Promise((r) => setTimeout(r, 3000));
  const info = await page.evaluate(() => ({
    rootLen: document.getElementById("root").innerHTML.length,
    hasPlayer: !!document.querySelector('[class*="fixed inset-x-0 bottom-0"]'),
  }));
  log("AFTER: " + JSON.stringify(info));
  await browser.close();
  log("DONE");
})().catch((e) => log("FATAL " + e.message));
