# Red Oak Media House — website

An educational, diagrammatic homepage for a website and Apple iOS application development company.

## Edit and build

Edit `source/Red Oak Media House.dc.html`, then run:

```sh
python3 scripts/build.py
python3 scripts/validate.py
node scripts/check-contact.cjs
```

The build preserves the existing DC runtime and self-contained export format. It writes `index.html` and `dist/index.html`. Both files contain the same page, scripts and original logo assets. No dependency installation is required.

`source/bundle-shell.html`, `source/bundle-design-system.html` and `source/bundle-assets.json` hold the original export loader and dependencies. `source/support.js` is the existing generated runtime. These are build inputs, not separate public pages. Preview the generated output; the editable DC source still uses export-resolved asset references.

```sh
python3 -m http.server 8768 --bind 127.0.0.1 --directory dist
```

## Content and contact

- Company contact: Support@redoakmediahouse.com · Richmond, Virginia.
- The development section is an open, condensed three-stage flow: Define, Design, and Build & launch. Each stage includes a wireframe, foundation blocks, and expandable details. Shared motion controls pause continuous diagram animations.
- Project names and portfolio content are deliberately deferred.
- The hero is an interactive code-created process diagram. It includes web/iOS selectors, pause/play controls and reduced-motion support. The original phone artwork remains in the source assets as an archive but is excluded from the rendered and bundled page.
- The project form validates the information and opens a prefilled email draft. The visitor must send that draft in their email app. It does not claim delivery, store inquiries or connect to a backend. The direct email link is also available.

## Publishing

The parent repository publishes GitHub Pages from `main` at the repository root. Run `python3 scripts/build.py` from the repository root to rebuild this source and copy `index.html` and `privacy.html` to the published location. The root `CNAME` preserves the existing domain. The root `_config.yml` excludes source and development files from the Pages output.

