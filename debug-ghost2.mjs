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
await page.waitForTimeout(3500);
const iframe = page.frames().find(f => f !== page.mainFrame());

const start = await iframe.evaluate(() => {
  const z = document.querySelector('.zone');
  if (!z) return null;
  const r = z.getBoundingClientRect();
  return { x: r.x, y: r.y, w: r.width, h: r.height };
});
console.log('PANEL start:', JSON.stringify(start));
if (!start) process.exit(0);

// drag panel far away
await page.mouse.move(start.x + start.w / 2, start.y + start.h / 2);
await page.mouse.down();
await page.mouse.move(start.x + start.w / 2 + 150, start.y + start.h / 2 + 120, { steps: 10 });
await page.mouse.up();
await page.waitForTimeout(400);
const moved = await iframe.evaluate(() => {
  const z = document.querySelector('.zone');
  const r = z.getBoundingClientRect();
  return { x: Math.round(r.x), y: Math.round(r.y), ghost: document.querySelectorAll('.zone-ghost').length, transform: z.style.transform };
});
console.log('MOVED:', JSON.stringify(moved));

// drag back to center of ghost (original)
await page.mouse.move(moved.x + 221, moved.y + 83);
await page.mouse.down();
await page.mouse.move(start.x + start.w / 2, start.y + start.h / 2, { steps: 15 });
await page.mouse.up();
await page.waitForTimeout(600);
const back = await iframe.evaluate(() => {
  const z = document.querySelector('.zone');
  const r = z.getBoundingClientRect();
  return { transform: z.style.transform, ghost: document.querySelectorAll('.zone-ghost').length, x: Math.round(r.x), y: Math.round(r.y) };
});
console.log('SNAP BACK:', JSON.stringify(back));

await browser.close();
preview.kill();
