/* Browser qualification. Requires Playwright; Chromium uses installed Chrome.
   REDOAK_PREVIEW_URL defaults to http://127.0.0.1:8774. */
const {chromium,firefox,webkit} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const base = process.env.REDOAK_PREVIEW_URL || 'http://127.0.0.1:8774';
const out = process.env.REDOAK_TEST_OUTPUT || '/private/tmp/redoak-browser-evidence';
fs.mkdirSync(out,{recursive:true});
(async()=>{
 const report=[];
 for (const [name,engine] of [['chromium',chromium],['firefox',firefox],['webkit',webkit]].filter(([name])=>!process.env.REDOAK_ENGINE||name===process.env.REDOAK_ENGINE)) {
  const browser=await engine.launch(name==='chromium'?{channel:'chrome',headless:true}:{headless:true});
  try {
   for(const width of [320,390,768,1280,1920]) {
    const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();const errors=[];const external=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith(base))external.push(r.url());});
    await page.goto(base);
    await page.getByRole('heading',{name:'Your next iOS product, clearly imagined.'}).waitFor();
    await page.keyboard.press(name==='webkit'?'Alt+Tab':'Tab');
    assert.equal(await page.evaluate(()=>document.activeElement.textContent),'Skip to content');
    await page.keyboard.press('Enter');
    const checkOverflow=async()=>assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,`${name} ${width}: overflow`);
    await checkOverflow();
    await page.getByRole('button',{name:'Copy brief',exact:true}).click();
    assert.equal(await page.locator('.project-form').evaluate(f=>f.checkValidity()),false);
    await page.getByLabel('iOS design',{exact:true}).check();
    await page.getByLabel('Name',{exact:true}).fill('Ana & Co');
    await page.getByLabel('Email',{exact:true}).fill('ana@example.com');
    await page.getByLabel('Your idea',{exact:true}).fill('A product & website? 100% useful.\nSecond line: + = # café');
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{window.__copied=text;}}}));
    await page.getByRole('button',{name:'Copy brief',exact:true}).click();
    await page.getByRole('status').filter({hasText:'Brief copied.'}).waitFor();
    assert.match(await page.evaluate(()=>window.__copied),/A product & website\? 100% useful/);
    await page.evaluate(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async()=>{throw Error('Denied')}}}));
    await page.getByRole('button',{name:'Copy brief',exact:true}).click();
    const manual=page.getByLabel('Select and copy your brief');
    await manual.waitFor();
    assert.match(await manual.inputValue(),/Ana & Co/);
    assert.equal(await manual.evaluate(e=>e.selectionEnd-e.selectionStart),await manual.inputValue().then(v=>v.length));
    await checkOverflow();
    // Test 200% CSS zoom as an additional reflow check, then restore.
    if(width>=1280){
      await page.evaluate(()=>document.documentElement.style.zoom='2');
      await checkOverflow();
      await page.evaluate(()=>document.documentElement.style.zoom='');
    }
    assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior),'auto');
    assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('.button')).transitionDuration),'0s');
    assert.deepEqual(external,[],`${name}: unexpected network dependencies`);
    assert.deepEqual(errors,[]);
    // Reset page state for a clean design screenshot.
    await page.reload();await page.getByRole('heading',{name:'Your next iOS product, clearly imagined.'}).waitFor();
    await page.evaluate(()=>window.scrollTo(0,0));
    if([390,1280].includes(width))await page.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true});
    if(width===1280){
      const words=(await page.locator('main').innerText()).trim().split(/\s+/).length;
      console.log(name,'marketing words',words);
    }
    report.push({browser:name,width,result:'pass'});await context.close();
   }
   const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(base);
   assert.match(await page.locator('body').innerText(),/iOS product design and interactive prototyping/);
   assert.equal(await page.getByRole('link',{name:'Support@redoakmediahouse.com',exact:true}).isVisible(),true);
   await context.close();
  } finally { await browser.close(); }
  fs.writeFileSync(`${out}/${name}-results.json`,JSON.stringify(report.filter(r=>r.browser===name),null,2));
  console.log('PASS:',name,'all five widths, form/copy fallback, 200% reflow, reduced motion, no-JS.');
 }
 fs.writeFileSync(`${out}/results.json`,JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
