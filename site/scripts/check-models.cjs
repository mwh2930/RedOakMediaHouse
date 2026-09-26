// Run with Playwright installed. REDOAK_PREVIEW_URL may point to a staged build.
const {chromium,webkit}=require('playwright');const assert=require('node:assert/strict');
(async()=>{for(const [name,engine] of [['chrome',chromium],['webkit',webkit]]){
const b=await engine.launch(name==='chrome'?{channel:'chrome'}:{});
for(const width of [320,390,768,1280,1920]){
const p=await b.newPage({viewport:{width,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto(process.env.REDOAK_PREVIEW_URL || 'http://127.0.0.1:8776/');await p.locator('.project-form').waitFor();
for(const [selector,states] of [['.design-model',['content','navigation','feedback']],['.approach-model',['brief','flow','handoff']],['.testing-model',['prototype','observe','refine']]]){
 for(const state of states){const button=p.locator(`${selector} button[aria-controls]`).filter({hasText:state==='content'?'CONTENT':state==='navigation'?'NAVIGATION':state==='feedback'?'FEEDBACK':new RegExp(state,'i')});await button.click();assert.equal(await p.locator(selector).getAttribute('data-focus'),state);assert.equal(await button.getAttribute('aria-pressed'),'true');}
}
assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
if(width===1280){
 await p.getByRole('button',{name:'Play design sequence',exact:true}).click();await p.waitForTimeout(2350);assert.equal(await p.locator('.design-model').getAttribute('data-focus'),'feedback');
 await p.getByRole('button',{name:'Play approach sequence',exact:true}).click();await p.waitForTimeout(1200);assert.equal(await p.locator('.approach-model').getAttribute('data-focus'),'flow');
 await p.getByRole('button',{name:'Explore brief deliverable',exact:true}).click();await p.waitForTimeout(1200);assert.equal(await p.locator('.approach-model').getAttribute('data-focus'),'brief');
 await p.getByRole('button',{name:'Play testing sequence',exact:true}).click();await p.waitForTimeout(2350);assert.equal(await p.locator('.testing-model').getAttribute('data-focus'),'refine');
}

const figure=p.locator('.design-model');await figure.scrollIntoViewIfNeeded();const bounds=await figure.boundingBox();
await p.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.25);await p.waitForTimeout(300);
assert.notEqual(await figure.evaluate(e=>e.style.getPropertyValue('--tilt-y')),'');
await p.mouse.move(0,0);assert.equal(await figure.evaluate(e=>e.style.getPropertyValue('--tilt-y')),'');
await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await p.locator('.model-playbar').first().isVisible(),false);assert.equal(await p.locator('.interface-layer').first().evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
await p.mouse.move(bounds.x+bounds.width*.8,bounds.y+bounds.height*.25);assert.equal(await figure.evaluate(e=>e.style.getPropertyValue('--tilt-y')),'');
assert.deepEqual(errors,[]);await p.close();
}console.log('PASS',name,'all widths: direct controls, sequences, cancellation, reduced motion, no overflow');await b.close();}})().catch(e=>{console.error(e);process.exitCode=1});
