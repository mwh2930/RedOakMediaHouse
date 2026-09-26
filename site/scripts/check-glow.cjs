// Requires Playwright; override REDOAK_PREVIEW_URL for another preview.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const preview = process.env.REDOAK_PREVIEW_URL || 'http://127.0.0.1:8776/';

(async () => {
  for (const [name, engine] of [['chrome', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch(name === 'chrome' ? { channel: 'chrome' } : {});
    for (const width of [320, 390, 768, 1280, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 900 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(preview);
      await page.locator('.testing-model').scrollIntoViewIfNeeded();

      const head = page.locator('.comet-observe .comet-head');
      assert.equal(await head.evaluate(element => getComputedStyle(element).animationIterationCount), 'infinite');
      assert.equal(await page.locator('.testing-model figcaption, .testing-model .model-playbar').count(), 0);
      assert.equal(new Set(await page.locator('.comet-head').evaluateAll(elements => elements.map(element => getComputedStyle(element).stroke))).size, 1);
      assert.equal(await page.locator('.comet-head').first().getAttribute('pathLength'), '1');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));

      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await head.isVisible(), false);
      assert.deepEqual(errors, []);
      await page.close();
    }
    await browser.close();
    console.log('PASS', name, 'five widths: continuous comet glow, equal colors, reduced motion, no controls, no overflow');
  }
})().catch(error => {
  console.error(error);
  process.exit(1);
});
