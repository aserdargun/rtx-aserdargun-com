"""Rebuild the original Blender source and web GLB with the installed Blender."""
import os
from pathlib import Path
import shutil
import subprocess

root = Path(__file__).resolve().parents[1]
blender = os.environ.get('RTX_BLENDER') or shutil.which('blender') or '/Applications/Blender.app/Contents/MacOS/Blender'
subprocess.run([blender, '--background', '--python', str(root / 'blender/build_atlas.py')], cwd=root, check=True)
