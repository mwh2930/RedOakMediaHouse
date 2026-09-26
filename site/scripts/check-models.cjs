// Run with Playwright installed. REDOAK_PREVIEW_URL may point to another build.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

const preview = process.env.REDOAK_PREVIEW_URL || 'http://127.0.0.1:8776/';
const cases = [
  ['.design-model', ['content', 'navigation', 'feedback'], stage => `Explore ${stage} layer`],
  ['.approach-model', ['brief', 'flow', 'handoff'], stage => `Explore ${stage} deliverable`],
  ['.testing-model', ['prototype', 'observe', 'refine'], stage => `Explore ${stage} stage`],
];

(async () => {
  for (const [name, engine] of [['chrome', chromium], ['webkit', webkit]]) {
    const browser = await engine.launch(name === 'chrome' ? { channel: 'chrome' } : {});
    for (const width of [320, 390, 768, 1280, 1920]) {
      const page = await browser.newPage({ viewport: { width, height: 1000 } });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(preview);
      await page.locator('.project-form').waitFor();

      for (const [selector, stages, label] of cases) {
        for (const stage of stages) {
          const button = page.getByRole('button', { name: label(stage), exact: true });
          await button.click();
          assert.equal(await page.locator(selector).getAttribute('data-focus'), stage);
          assert.equal(await button.getAttribute('aria-pressed'), 'true');
        }
      }

      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
      assert.equal(await page.getByRole('button', { name: 'Play testing sequence' }).count(), 0);
      const figure = page.locator('.design-model');
      await figure.scrollIntoViewIfNeeded();
      const bounds = await figure.boundingBox();
      await page.mouse.move(bounds.x + bounds.width * .8, bounds.y + bounds.height * .25);
      await page.waitForTimeout(300);
      assert.notEqual(await figure.evaluate(element => element.style.getPropertyValue('--tilt-y')), '');
      await page.mouse.move(0, 0);
      assert.equal(await figure.evaluate(element => element.style.getPropertyValue('--tilt-y')), '');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      assert.equal(await page.locator('.model-playbar').first().isVisible(), false);
      assert.equal(await page.locator('.interface-layer').first().evaluate(element => getComputedStyle(element).transitionDuration), '0s');
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log('PASS', name, 'all widths: direct controls, finite sequences, reduced motion, no overflow');
    await browser.close();
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
