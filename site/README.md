# Red Oak Media House — website

## What's here

- `index.html` — the whole site in one self-contained file. Logo, hero image, styles and scripts are inlined. This is the file you deploy.
- `assets/` — the original image files (logo lockup, reversed logo, mark, hero render).
- `source/` — the editable source: `Red Oak Media House.dc.html` plus its `support.js` runtime. Edit here, not in `index.html`.

## Deploy on GitHub Pages

1. Push this folder to a public repo.
2. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
3. Live at `yourname.github.io/reponame`.

### Custom domain (GoDaddy)

4. Settings → Pages → Custom domain → enter your domain.
5. GoDaddy → Domain → DNS: four A records on `@` → 185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153. CNAME on `www` → `yourname.github.io`.
6. Tick Enforce HTTPS once the certificate is issued.

## Deploy on GoDaddy cPanel hosting

Upload `index.html` into `public_html`, replacing the placeholder page.

## Notes

- The hero render includes Apple's own app icons. Everything else on the page avoids Apple artwork — no Apple logo, no App Store badge, icons drawn from scratch, system font stack rather than bundled Apple fonts. Swap the render for one with a blank home screen if you want it airtight.
- Still placeholder content: the budget bands in the contact form, and "the same two people" in the services intro.
- Contact: Support@redoakmediahouse.com · Richmond, Virginia.
