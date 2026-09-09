#!/usr/bin/env python3
"""Rebuild the original self-contained DC export using the editable homepage."""
from pathlib import Path
import base64
import gzip
import json
import re

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source'
source = (SOURCE / 'Red Oak Media House.dc.html').read_text()
manifest = json.loads((SOURCE / 'bundle-assets.json').read_text())
shell = (SOURCE / 'bundle-shell.html').read_text()
design_system = (SOURCE / 'bundle-design-system.html').read_text()
source = re.sub(r'<link rel="stylesheet" href="_ds/[^\"]+">\s*<script src="_ds/[^\"]+"></script>', lambda _: design_system, source, count=1)
assets = {
    './support.js': ('b00552e6-6e35-4e57-85cf-e4033c98691d', SOURCE / 'support.js'),
    'assets/red-oak-logo-reversed.png': ('3029a901-48f9-49ee-b16a-30d50459f24f', ROOT / 'assets/red-oak-logo-reversed.png'),
    'assets/hero-iphone.png': ('300a7f8d-3d74-4c43-a772-c01eaa2c1eb3', ROOT / 'assets/hero-iphone.png'),
    'assets/red-oak-mark-reversed.png': ('f04d7547-d6fb-4fe3-a2d9-718582d8f1c3', ROOT / 'assets/red-oak-mark-reversed.png'),
}
for url, (asset_id, path) in assets.items():
    if 'src="' + url + '"' not in source:
        manifest.pop(asset_id, None)
        continue
    data = path.read_bytes()
    if manifest[asset_id].get('compressed'):
        data = gzip.compress(data, mtime=0)
    manifest[asset_id]['data'] = base64.b64encode(data).decode('ascii')
    source = source.replace('src="' + url + '"', 'src="' + asset_id + '"')
# The original DC export preserves camel-case event attributes through HTML parsing.
source = source.replace('onSubmit=', 'sc-camel-on-submit=').replace('onClick=', 'sc-camel-on-click=').replace('viewBox=', 'sc-camel-view-box=').replace('preserveAspectRatio=', 'sc-camel-preserve-aspect-ratio=')
for attr, encoded in {'markerWidth':'marker-width','markerHeight':'marker-height','refX':'ref-x','refY':'ref-y','markerUnits':'marker-units'}.items():
    source = source.replace(attr + '=', 'sc-camel-' + encoded + '=')
def safe_json(value):
    return json.dumps(value, ensure_ascii=True, separators=(',', ':')).replace('<', '\\u003c')
output = shell.replace('__RED_OAK_MANIFEST__', safe_json(manifest)).replace('__RED_OAK_TEMPLATE__', safe_json(source))
assert '__RED_OAK_' not in output
(ROOT / 'index.html').write_text(output)
(ROOT / 'dist').mkdir(exist_ok=True)
(ROOT / 'dist/index.html').write_text(output)
print('Built index.html and dist/index.html from the editable DC source.')

# Standalone legal page uses local system fonts and no JavaScript.
privacy = (SOURCE / "privacy.html").read_text()
(ROOT / "privacy.html").write_text(privacy)
(ROOT / "dist/privacy.html").write_text(privacy)
