const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/root/.cache/ms-playwright/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell',
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1600 } });

  const shots = [
    { url: 'http://localhost:3201/digest', out: '../../docs/screenshots/digest.png' },
    { url: 'http://localhost:3201/portfolio-health', out: '../../docs/screenshots/portfolio-health.png' },
    { url: 'http://localhost:3201/securities/NVDA', out: '../../docs/screenshots/security-detail-brief.png' },
  ];

  for (const s of shots) {
    await page.goto(s.url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: s.out, fullPage: true });
    console.log('saved', s.out);
  }

  await browser.close();
})();
