const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/root/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

  const base = process.env.SCREENSHOT_BASE_URL || 'http://localhost:3000';
  const shots = [
    { url: `${base}/`, out: '../../docs/screenshots/triage-inbox.png' },
    { url: `${base}/portfolio-health`, out: '../../docs/screenshots/portfolio-health.png' },
    { url: `${base}/securities/NVDA`, out: '../../docs/screenshots/security-detail-nvda.png' },
  ];

  for (const s of shots) {
    await page.goto(s.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: s.out, fullPage: true });
    console.log('saved', s.out);
  }

  await browser.close();
})();
