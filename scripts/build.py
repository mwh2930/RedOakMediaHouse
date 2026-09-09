#!/usr/bin/env python3
"""Build the editable site and sync the GitHub Pages root output."""
from pathlib import Path
import shutil
import subprocess
import sys
ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
subprocess.run([sys.executable, str(SITE / 'scripts/build.py')], check=True)
subprocess.run([sys.executable, str(SITE / 'scripts/validate.py')], check=True)
for name in ('index.html', 'privacy.html'):
    shutil.copyfile(SITE / 'dist' / name, ROOT / name)
    assert (ROOT / name).read_bytes() == (SITE / 'dist' / name).read_bytes()
print('GitHub Pages root files match the validated site output.')
