// Checks every page of the site: local links and assets resolve, and (when
// Playwright is installed) each page loads at phone and desktop widths without
// script errors, failed local requests or horizontal scrolling.
//
// Usage: node .claude/skills/check-site/check_pages.mjs [screenshot-dir]
// Exits non-zero if any problem is found.
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const SHOT_DIR = process.argv[2];
const WIDTHS = [390, 1280];
const TYPES = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.webp': 'image/webp', '.pdf': 'application/pdf', '.xml': 'application/xml', '.txt': 'text/plain',
  '.md': 'text/markdown', '.csv': 'text/csv', '.ico': 'image/x-icon',
};

const problems = [];
const notes = [];

const pages = ['index.html', '404.html', ...readdirSync(join(ROOT, 'projects'))
  .map((name) => `projects/${name}/index.html`)
  .filter((page) => existsSync(join(ROOT, page)))];

// 1. Local links and assets. 404.html uses absolute paths, so "/" means the repo root.
for (const page of pages) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  for (const [, attr, url] of html.matchAll(/\s(href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#|javascript:)/.test(url)) continue;
    const path = url.split(/[?#]/)[0];
    if (!path) continue;
    let target = path.startsWith('/') ? join(ROOT, path) : join(ROOT, dirname(page), path);
    if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
    if (!existsSync(target)) problems.push(`${page}: ${attr}="${url}" does not exist`);
  }
  for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) {
    if (!html.includes(`id="${id}"`)) problems.push(`${page}: link to #${id} has no matching id`);
  }
}

// 2. Browser checks, if Playwright is available.
async function loadPlaywright() {
  try {
    return await import('playwright');
  } catch {
    try {
      const globalRoot = execSync('npm root -g', { encoding: 'utf8' }).trim();
      return createRequire(join(globalRoot, 'noop.js'))('playwright');
    } catch {
      return null;
    }
  }
}

const playwright = await loadPlaywright();
if (!playwright) {
  notes.push('Playwright is not installed, so browser checks were skipped (link checks still ran).');
} else {
  const server = createServer((req, res) => {
    let path = join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (existsSync(path) && statSync(path).isDirectory()) path = join(path, 'index.html');
    if (!path.startsWith(ROOT) || !existsSync(path)) {
      res.writeHead(404, { 'content-type': 'text/html' });
      res.end(readFileSync(join(ROOT, '404.html')));
      return;
    }
    res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
    res.end(readFileSync(path));
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  const origin = `http://127.0.0.1:${server.address().port}`;
  if (SHOT_DIR) mkdirSync(SHOT_DIR, { recursive: true });

  const browser = await playwright.chromium.launch();
  const offline = new Set();
  for (const page of pages) {
    const url = `${origin}/${page.replace(/index\.html$/, '')}`;
    for (const width of WIDTHS) {
      const tab = await browser.newPage({ viewport: { width, height: 900 } });
      const label = `${page} @ ${width}px`;
      tab.on('pageerror', (error) => problems.push(`${label}: script error: ${error.message}`));
      tab.on('console', (message) => {
        // Errors from blocked external hosts (fonts, Binance) are reported separately below.
        if (message.type() === 'error' && !/net::ERR_|Failed to load resource/.test(message.text())) {
          problems.push(`${label}: console error: ${message.text()}`);
        }
      });
      tab.on('requestfailed', (request) => {
        const host = new URL(request.url()).host;
        if (request.url().startsWith(origin)) problems.push(`${label}: failed to load ${request.url().slice(origin.length)}`);
        else offline.add(host);
      });
      tab.on('response', (response) => {
        if (response.url().startsWith(origin) && response.status() >= 400 && page !== '404.html') {
          problems.push(`${label}: ${response.status()} for ${response.url().slice(origin.length)}`);
        }
      });
      await tab.goto(url, { waitUntil: 'load' });
      await tab.waitForTimeout(500);
      const overflow = await tab.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (overflow > 0) problems.push(`${label}: page scrolls sideways by ${overflow}px`);
      if (SHOT_DIR) {
        const name = `${page.replace(/\/index\.html$|\.html$/, '').replace(/\//g, '-')}-${width}.png`;
        await tab.screenshot({ path: join(SHOT_DIR, name), fullPage: true });
      }
      await tab.close();
    }
  }
  await browser.close();
  server.close();
  if (offline.size) notes.push(`External hosts that could not be reached (expected offline or in a sandbox): ${[...offline].join(', ')}`);
  if (SHOT_DIR) notes.push(`Screenshots saved to ${resolve(SHOT_DIR)}`);
}

console.log(`Checked ${pages.length} pages: ${pages.join(', ')}`);
for (const note of notes) console.log(`note: ${note}`);
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`);
  for (const problem of problems) console.log(`- ${problem}`);
  process.exit(1);
}
console.log('No problems found.');
