#!/usr/bin/env python3
"""Validate generated delivery content without browser or visual inspection."""
from pathlib import Path
from html.parser import HTMLParser
from collections import Counter
import base64
import gzip
import json
import re
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT/'source/Red Oak Media House.dc.html').read_text()
output = (ROOT/'index.html').read_text()
assert output == (ROOT/'dist/index.html').read_text(), 'Delivery copies differ'
assert not re.search('blue.?water|marlin|hero-iphone', source, re.I), 'Removed portfolio/photo content remains'
assert 'Bundled Page' not in output
assert 'same two people' not in source and 'Received' not in source

def bundle_value(name):
    match = re.search(r'<script type="__bundler/'+name+r'">\s*(.*?)\s*</script>', output, re.S)
    assert match, name
    return json.loads(match.group(1))

template = bundle_value('template')
manifest = bundle_value('manifest')
assert '300a7f8d-3d74-4c43-a772-c01eaa2c1eb3' not in manifest, 'Hero photo still embedded'
assert 'BlueWater' not in output
assert 'sc-camel-on-click=' in template and 'sc-camel-on-submit=' in template
assert 'sc-camel-view-box=' in template
assert 'sc-camel-preserve-aspect-ratio=' in template
assert 'prefers-reduced-motion' in template and 'forced-colors' in template
assert 'opacity:0' not in source.split('.route-flow')[0], 'Content must not depend on entrance animations'

class Inspect(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids=[]; self.links=[]; self.srcs=[]; self.tags=Counter(); self.inputs=[]; self.controls=[]
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs); self.tags[tag]+=1
        if 'id' in attrs: self.ids.append(attrs['id'])
        if 'href' in attrs: self.links.append(attrs['href'])
        if 'src' in attrs: self.srcs.append(attrs['src'])
        if 'aria-controls' in attrs: self.controls.extend(attrs['aria-controls'].split())
        if tag in ('input','textarea'): self.inputs.append(attrs)

page=Inspect(); page.feed(template)
assert page.tags['h1']==1 and page.tags['main']==1
assert len(set(page.ids))==len(page.ids), 'Duplicate id'
for href in page.links:
    if href.startswith('#'): assert href[1:] in page.ids, href
for target in page.controls: assert target in page.ids, 'Missing controlled diagram: '+target
for target in re.findall(r'url\(#([\w-]+)\)', template): assert target in page.ids, target
for src in page.srcs: assert src in manifest or src.startswith('data:'), 'Unbundled resource: '+src
for field in page.inputs: assert field.get('name'), 'Missing form field name'
assert {'name','email','details','projectType'} == {x['name'] for x in page.inputs}
for data in manifest.values():
    binary=base64.b64decode(data['data'], validate=True)
    if data.get('compressed'): binary=gzip.decompress(binary)
    assert binary
for script in re.findall(r'<script(?:\s[^>]*)?>(.*?)</script>', template, re.S):
    if script.strip():
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js') as file:
            file.write(script); file.flush()
            subprocess.run(['node','--check',file.name],check=True,capture_output=True)
print('PASS: generated source, metadata, sections, form structure, local anchors, bundle assets, script syntax, and requested removals.')
