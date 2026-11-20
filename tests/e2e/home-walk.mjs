// Key scenarios of the homepage (widths 320-1920, VIN copy + Telegram, tabs, FutureLink, anchors, menu, phone bar, reduced motion, no JS).
// Uses the studio Playwright from ~/.veon/tools: VEON_WEB_STUDIO=<studio> node tests/e2e/home-walk.mjs <url> <screens dir>
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const studio = process.env.VEON_WEB_STUDIO || path.join(os.homedir(), 'Documents', 'ai-web-studio');
const { loadPlaywright, launchBrowser } = await import(pathToFileURL(path.join(studio, 'quality', 'scripts', 'veon_pw.mjs')).href);
const [url, out] = process.argv.slice(2);
const { chromium } = loadPlaywright();
const browser = await launchBrowser(chromium);
const log = (...a) => console.log(...a);

// 1. widths: overflow and key elements inside the screen
for (const w of [320, 375, 768, 1024, 1440, 1920]) {
  const page = await browser.newPage({ viewport: { width: w, height: 800 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(url, { waitUntil: 'networkidle' });
  const r = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const outside = [...document.querySelectorAll('a, button, input, h1, h2, h3, [role=link]')].filter((e) => {
      const b = e.getBoundingClientRect();
      return b.width > 0 && (b.left < -1 || b.right > vw + 1);
    }).map((e) => (e.textContent || e.id || e.className).trim().slice(0, 30));
    return { over: document.documentElement.scrollWidth - vw, outside, h1: document.querySelectorAll('h1').length };
  });
  log(w, JSON.stringify(r), errs.join('|'));
  await page.close();
}

// 2. desktop interactions
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.click('#vin-input');
  await page.keyboard.type('wvwzzz1kzaw0o0123x9');
  const v = await page.evaluate(() => ({ val: document.querySelector('#vin-input').value, filled: document.querySelectorAll('.vin__cell.is-filled').length, count: document.querySelector('[data-vin-count]').textContent }));
  log('vin', JSON.stringify(v));
  await page.screenshot({ path: `${out}/vin-typed-1440.png`, clip: { x: 0, y: 600, width: 1440, height: 260 } });
  const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), page.click('[data-vin-send]')]);
  await page.waitForTimeout(300);
  const clip = await page.evaluate(() => navigator.clipboard.readText().catch(() => 'n/a'));
  log('send: popup', popup ? popup.url() : 'none', 'clipboard', clip, 'status', await page.textContent('[data-vin-status]'));
  if (popup) await popup.close();
  await page.click('#tab-art');
  await page.waitForTimeout(400);
  log('article actions', JSON.stringify(await page.evaluate(() => [...document.querySelectorAll('#panel-art a')].map((a) => a.getAttribute('href')))));
  log('tabs', JSON.stringify(await page.evaluate(() => ({ art: document.querySelector('#panel-art').classList.contains('is-active'), vinInert: document.querySelector('#panel-vin').inert, line: getComputedStyle(document.querySelector('.vin__tab-line')).transform }))));
  await page.keyboard.press('ArrowLeft');
  log('arrow back', await page.evaluate(() => document.activeElement.id));
  // FutureLink focus note
  await page.focus('.cats .future-link');
  await page.waitForTimeout(300);
  log('note opacity on focus', await page.evaluate(() => getComputedStyle(document.activeElement.querySelector('.future-link__note')).opacity));
  // anchors
  await page.click('.header__nav a[href="#sto"]');
  await page.waitForTimeout(900);
  log('sto top after anchor', await page.evaluate(() => Math.round(document.querySelector('#sto').getBoundingClientRect().top)), 'header scrolled', await page.evaluate(() => document.querySelector('[data-header]').classList.contains('is-scrolled')));
  // details
  await page.click('#service summary');
  log('details open', await page.evaluate(() => document.querySelector('#service details').open));
  await ctx.close();
}

// 3. phone: menu, bar
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto(url, { waitUntil: 'networkidle' });
  log('bar at top shown', await page.evaluate(() => document.querySelector('[data-mbar]').classList.contains('is-shown')));
  await page.click('.menu__toggle');
  await page.waitForTimeout(200);
  await page.screenshot({ path: `${out}/menu-390.png` });
  log('menu covers page', await page.evaluate(() => { const el = document.elementFromPoint(195, 780); return Boolean(el && el.closest('.menu__panel')) && getComputedStyle(document.documentElement).overflow === 'hidden'; }));
  await page.click('.menu__nav a[href="#contacts"]');
  await page.waitForTimeout(900);
  log('menu closed', await page.evaluate(() => !document.querySelector('[data-menu]').open), 'bar shown', await page.evaluate(() => document.querySelector('[data-mbar]').classList.contains('is-shown')));
  await page.screenshot({ path: `${out}/contacts-390.png` });
  await page.close();
}

// 4. reduced motion and no JS
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  log('reduced: cell anim', await page.evaluate(() => getComputedStyle(document.querySelector('.vin__cell')).animationName));
  await ctx.close();
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
  const p2 = await ctx2.newPage();
  await p2.goto(url, { waitUntil: 'load' });
  await p2.screenshot({ path: `${out}/nojs-1440.png`, fullPage: false });
  log('nojs bridge bar transform', await p2.evaluate(() => 1).catch(() => 'js off'));
  await ctx2.close();
}
await browser.close();
