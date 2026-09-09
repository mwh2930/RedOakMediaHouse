const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'source/Red Oak Media House.dc.html'), 'utf8');
const code = source.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/)[1];
let navigations = [];
const sandbox = {
  DCLogic: class { setState(next) { this.state = {...this.state, ...next}; } },
  React: { createElement: () => null },
  FormData: class { constructor(form) { this.fields = form.fields; } get(name) { return this.fields[name]?.value || null; } },
  window: { location: { set href(url) { navigations.push(url); } } },
};
vm.createContext(sandbox);
vm.runInContext(code + '\nthis.ComponentForCheck = Component;', sandbox);
function submit(values, valid = true) {
  const component = new sandbox.ComponentForCheck();
  const fields = Object.fromEntries(Object.entries(values).map(([name, value]) => [name, { value }]));
  let checks = 0;
  const form = {
    fields,
    elements: { namedItem: name => fields[name] },
    reportValidity() { checks++; return valid && ['name','email','details','projectType'].every(name => fields[name].value.length > 0); }
  };
  let prevented = false;
  component.renderVals().openEmailDraft({ currentTarget: form, preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(checks, 1);
  return { component, fields };
}
for (const projectType of ['Website','iOS application','Both / exploring an idea']) {
  const result = submit({projectType, name:'  Ana & Co  ', email:' ana@example.com ', details:'  A website & app? 100% useful.\nSecond line: + = # café  '});
  const url = new URL(navigations.at(-1));
  assert.equal(url.protocol, 'mailto:');
  assert.equal(url.pathname, 'Support@redoakmediahouse.com');
  assert.equal(url.searchParams.get('subject'), 'Red Oak project inquiry: ' + projectType);
  assert.equal(url.searchParams.get('body'), 'Project: '+projectType+'\r\nName: Ana & Co\r\nEmail: ana@example.com\r\n\r\nA website & app? 100% useful.\nSecond line: + = # café');
  assert.equal(result.component.state.draftOpened, true);
  assert.equal(result.fields.details.value.includes('Second line'), true);
}
const baseline = navigations.length;
for (const [values, valid] of [
  [{projectType:'Website', name:'   ', email:'a@example.com', details:'A website'}, true],
  [{projectType:'Website', name:'Ana', email:'a@example.com', details:'   '}, true],
  [{projectType:'Website', name:'Ana', email:'bad-email', details:'A website'}, false],
  [{projectType:'', name:'Ana', email:'a@example.com', details:'A website'}, false],
]) {
  const result = submit(values, valid);
  assert.equal(result.component.state.draftOpened, false);
}
assert.equal(navigations.length, baseline);
console.log('PASS: all project types, encoded punctuation, retained details, required/blank/invalid input, and honest draft state.');
let preferenceListener;
let listenerRemoved = false;
sandbox.window.matchMedia = () => ({
  matches: false,
  addEventListener(type, callback) { assert.equal(type, 'change'); preferenceListener = callback; },
  removeEventListener(type, callback) { assert.equal(callback, preferenceListener); listenerRemoved = true; }
});
const diagram = new sandbox.ComponentForCheck();
diagram.componentDidMount();
assert.equal(diagram.renderVals().motionState, 'playing');
assert.equal(diagram.renderVals().motionControlLabel, 'Pause all diagram animations');
diagram.renderVals().chooseIOS();
assert.equal(diagram.renderVals().iosSelected, true);
assert.equal(diagram.renderVals().webSelected, false);
assert.match(diagram.renderVals().diagramDescription, /Apple iOS/);
diagram.renderVals().chooseWeb();
assert.equal(diagram.renderVals().webSelected, true);
assert.match(diagram.renderVals().diagramDescription, /browser/);
diagram.renderVals().toggleMotion();
assert.equal(diagram.renderVals().motionState, 'paused');
assert.equal(diagram.renderVals().motionControlLabel, 'Play all diagram animations');
diagram.renderVals().toggleMotion();
assert.equal(diagram.renderVals().motionState, 'playing');
preferenceListener({matches:true});
assert.equal(diagram.renderVals().motionButtonLabel, 'Motion off');
assert.equal(diagram.renderVals().reducedMotion, true);
diagram.renderVals().toggleMotion();
assert.equal(diagram.renderVals().motionState, 'paused');
diagram.componentWillUnmount();
assert.equal(listenerRemoved, true);
console.log('PASS: diagram paths, descriptions, play/pause, reduced-motion changes, and listener cleanup.');

const examples = new sandbox.ComponentForCheck();
for(const match of source.matchAll(/\{\{\s*(\w+)\s*\}\}/g)) {
  if (!['true','false'].includes(match[1])) assert.notEqual(examples.renderVals()[match[1]], undefined, match[1]);
}
console.log('PASS: complete template bindings.');
