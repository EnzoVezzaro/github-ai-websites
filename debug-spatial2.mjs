import { chromium } from '@playwright/test';
import { spawn } from 'child_process';
const preview = spawn('bunx', ['vite', 'preview', '--port', '5199', '--strictPort'], { stdio: 'ignore' });
await new Promise(r => setTimeout(r, 3000));
const browser = await chromium.launch({ headless: true, executablePath: '/Users/mac/Library/Caches/ms-playwright/chromium-1234/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing' });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on('pageerror', e => { if (!String(e).includes('localStorage')) console.log('[pageerror]', String(e).slice(0, 200)); });
await page.addInitScript(() => {
  localStorage.setItem('random-web:github.token', JSON.stringify('ghp_test'));
  localStorage.setItem('random-web:ai.apiKey', JSON.stringify('sk-test'));
});
await page.goto('http://localhost:5199/');
await page.waitForTimeout(3000);

async function card(lbl) {
  return page.evaluate((l) => {
    const els = Array.from(document.querySelectorAll('[class*="cursor-pointer"]')).filter(c => c.textContent?.startsWith(l));
    if (!els.length) return null;
    const r = els[0].getBoundingClientRect();
    return { x: r.x, y: r.y, w: r.width, h: r.height, cls: els[0].className.slice(0, 50) };
  }, lbl);
}
async function zoneRects() {
  return page.evaluate(() => Array.from(document.querySelectorAll('.border-dashed')).map(d => {
    const r = d.getBoundingClientRect();
    const lbl = d.querySelector('div')?.textContent?.trim();
    return { lbl, x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  }));
}

const zonesBefore = await zoneRects();
console.log('ZONES:', JSON.stringify(zonesBefore));

// Drag Intro (in panel A) into Panel C → zone C should grow, A shrink
const intro = await card('Intro');
console.log('INTRO at:', JSON.stringify(intro));
const panelC = zonesBefore.find(z => z.lbl === 'Panel C');
if (intro && panelC) {
  await page.mouse.move(intro.x + intro.w / 2, intro.y + 12);
  await page.mouse.down();
  await page.mouse.move(panelC.x + panelC.w / 2, panelC.y + panelC.h / 2, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(800);
}
const zonesAfter = await zoneRects();
const cBefore = zonesBefore.find(z => z.lbl === 'Panel C');
const cAfter = zonesAfter.find(z => z.lbl === 'Panel C');
const aBefore = zonesBefore.find(z => z.lbl === 'Panel A');
const aAfter = zonesAfter.find(z => z.lbl === 'Panel A');
console.log('ZONE C grew:', cBefore.w * cBefore.h < cAfter.w * cAfter.h, cBefore, '->', cAfter);
console.log('ZONE A shrank:', aBefore.w * aBefore.h > aAfter.w * aAfter.h, aBefore, '->', aAfter);

// Drag a block to EMPTY space → becomes free (floating)
const story = await card('Story');
if (story) {
  await page.mouse.move(story.x + story.w / 2, story.y + 12);
  await page.mouse.down();
  await page.mouse.move(200, 120, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(600);
  const storyAfter = await card('Story');
  console.log('STORY free at:', JSON.stringify(storyAfter));
  console.log('FREE BLOCK (not in zone):', storyAfter ? (storyAfter.y < 300 ? 'yes' : 'no') : 'none');
}

await browser.close();
preview.kill();
