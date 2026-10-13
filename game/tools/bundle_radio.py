#!/usr/bin/env python3
"""Build the desk radio demo into single files.

  dist/radio-demo.html      standalone page, open it straight from disk
  dist/radio-artifact.html  the same without a document skeleton, for the claude.ai Artifact host

Usage: python3 tools/bundle_radio.py   (run from anywhere)
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()

page = read('radio-demo.html')
page = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
              lambda m: '<style>\n' + read(m.group(1)) + '\n</style>', page)
page = re.sub(r'<script src="(js/[^"]+)"></script>',
              lambda m: '<script>\n' + read(m.group(1)).replace('</script', '<\\/script') + '\n</script>', page)

standalone = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              '</head>\n<body>\n' + page + '\n</body>\n</html>\n')
os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
for name, text in (('radio-demo.html', standalone), ('radio-artifact.html', page)):
    with open(os.path.join(ROOT, 'dist', name), 'w', encoding='utf-8') as f:
        f.write(text)
    print('wrote dist/%s (%d KB)' % (name, len(text.encode()) // 1024))
