# Red Oak Media House

Website: https://redoakmediahouse.com/

GitHub Pages publishes the **root of `main`**. The public delivery files are `index.html`, `privacy.html`, and the existing `CNAME`. `_config.yml` excludes development source from the Pages output.

## Edit and publish

1. Edit `site/source/Red Oak Media House.dc.html` or `site/source/privacy.html`.
2. Run `python3 scripts/build.py` from this repository root.
3. For behavior changes, run `node site/scripts/check-contact.cjs`.
4. Commit the source and regenerated root files, then push to `origin/main`.
5. Verify the GitHub Pages deployment and custom-domain output.

Do not edit the generated HTML by hand. Updating `site/index.html` alone does not update the public homepage.

The privacy page remains a labeled draft pending review of company legal records.

The Sites address is a separate preview deployment. Its Git repository does not automatically synchronize with this GitHub repository.
