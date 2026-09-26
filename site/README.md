# Red Oak Media House — website

A company-first homepage for iOS product design, interactive prototyping, and focused usability testing.

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

- Company contact: Support@redoakmediahouse.com.
- Each content section includes an open visual model, selectable stages, and a native disclosure for deeper detail. Selection state stays in page memory.
- Navigation highlights iOS design and prototype testing. The site explains familiar platform conventions, accessibility considerations, and a task → observations → refinement process.
- Steel gradients give headings a reflective finish, with solid text fallbacks for contrast preferences.
- Deliverables are product definition, interface design, and a prototype with design handoff. Production development and release services are not advertised.
- The page uses system fonts, an existing light-background logo, CSS material illustrations, and SVG wireframes. The testing loop has continuous comet trails with a pause control and reduced-motion fallback. Other sequences play only on request. No tracking or backend was added.
- The form validates details and opens a prefilled email draft. Copy brief uses the clipboard only on request, with a manual-copy fallback. Nothing is claimed as sent.
- The privacy page remains an explicit draft pending company records. Its interaction descriptions match the contact form.

## Browser checks

Start a local server at the repository root or generated `dist` folder, then run `scripts/check-browser.cjs` with Playwright available to Node. Set `REDOAK_PREVIEW_URL` to override the default `http://127.0.0.1:8774`. Chromium uses installed Chrome; Firefox and WebKit require their Playwright browsers. `REDOAK_ENGINE` can select one engine and `REDOAK_TEST_OUTPUT` can set the evidence directory.

The suite checks five widths (320, 390, 768, 1280, 1920), keyboard focus, form validation, clipboard fallback, desktop CSS 200% zoom, reduced motion, and no-JavaScript content. The additional `check-models.cjs` and `check-glow.cjs` scripts verify direct diagram controls, pointer response, playback, pause/resume, and reduced motion in Chromium and WebKit (default preview port 8776). Actual Safari requires separate qualification; WebKit results are not a native Safari certification.

## Publishing

The parent repository publishes GitHub Pages from `main` at the repository root. Run `python3 scripts/build.py` from the repository root to rebuild this source and copy `index.html` and `privacy.html` to the published location. The root `CNAME` preserves the existing domain. The root `_config.yml` excludes source and development files from the Pages output.

