#!/usr/bin/env python3
"""Inline css/js into single-file builds of this story.

  dist/<story-id>.html   standalone page, open it straight from disk
  dist/artifact.html     same story without the <html>/<head>/<body> skeleton,
                         which is the shape the claude.ai Artifact host wants

The story id is this folder's name. Usage: python3 tools/bundle.py (run from anywhere)
"""
import os, re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
NAME = os.path.basename(ROOT).lstrip('_') or 'story'

def read(rel):
    with open(os.path.join(ROOT, rel), encoding='utf-8') as f:
        return f.read()

def section(html, name):
    m = re.search(r'<!-- BUNDLE:%s -->(.*?)<!-- /BUNDLE:%s -->' % (name, name), html, re.S)
    return m.group(1).strip()

def inline(block):
    block = re.sub(r'<link rel="stylesheet" href="(css/[^"]+)">',
                   lambda m: '<style>\n' + read(m.group(1)) + '\n</style>', block)
    block = re.sub(r'<script src="(js/[^"]+)"></script>',
                   lambda m: '<script>\n' + read(m.group(1)).replace('</script', '<\\/script') + '\n</script>', block)
    return block

html = read('index.html')
head = inline(section(html, 'HEAD'))
body = section(html, 'BODY')
scripts = inline(section(html, 'SCRIPTS'))

os.makedirs(os.path.join(ROOT, 'dist'), exist_ok=True)
standalone = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
              '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
              + head + '\n</head>\n<body>\n' + body + '\n' + scripts + '\n</body>\n</html>\n')
artifact = head + '\n' + body + '\n' + scripts + '\n'
for name, text in ((NAME + '.html', standalone), ('artifact.html', artifact)):
    with open(os.path.join(ROOT, 'dist', name), 'w', encoding='utf-8') as f:
        f.write(text)
    print('wrote dist/%s (%d KB)' % (name, len(text.encode()) // 1024))
