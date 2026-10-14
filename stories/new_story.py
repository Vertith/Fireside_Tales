#!/usr/bin/env python3
"""Start a new Fireside tale from the template.

  python3 stories/new_story.py asylum "The Asylum"

Copies stories/_template to stories/<id>/ and gives the copy its own id, title
and save key. The copy is the story's own from then on: nothing links it back
to the template or to any other story, so changing it never changes them.
"""
import os, re, shutil, sys

HERE = os.path.dirname(os.path.abspath(__file__))

def main():
    if len(sys.argv) != 3 or not re.fullmatch(r'[a-z][a-z0-9-]*', sys.argv[1]):
        sys.exit('usage: new_story.py <id: lowercase-with-dashes> "<Title>"')
    sid, title = sys.argv[1], sys.argv[2]
    dst = os.path.join(HERE, sid)
    if os.path.exists(dst):
        sys.exit('stories/%s already exists; not touching it' % sid)
    shutil.copytree(os.path.join(HERE, '_template'), dst, ignore=shutil.ignore_patterns('dist'))

    def edit(rel, pairs):
        p = os.path.join(dst, rel)
        s = open(p, encoding='utf-8').read()
        for a, b in pairs:
            s = s.replace(a, b)
        open(p, 'w', encoding='utf-8').write(s)

    edit('js/content/config.js', [
        ("id: 'template'", "id: '%s'" % sid),
        ("title: 'Untitled Tale'", "title: %r" % title),
        ("'fireside.template.save.v1'", "'fireside.%s.save.v1'" % sid),
    ])
    edit('index.html', [
        ('<title>Untitled Tale</title>', '<title>%s</title>' % title),
        ('<span class="brand">Untitled Tale</span>', '<span class="brand">%s</span>' % title),
        ('<h1 class="title-word">UNTITLED</h1>', '<h1 class="title-word">%s</h1>' % title.upper()),
    ])
    with open(os.path.join(dst, 'FORKED.md'), 'w', encoding='utf-8') as f:
        f.write('# %s\n\nStarted from `stories/_template` on its version of %s. '
                'This folder is %s\'s own copy: edit anything here freely.\n' % (title, template_date(), title))
    print('made stories/%s/ (open stories/%s/index.html to play the placeholder scene)' % (sid, sid))

def template_date():
    s = open(os.path.join(HERE, '_template', 'README.md'), encoding='utf-8').read()
    m = re.search(r'Template version: (.+)', s)
    return m.group(1).strip() if m else 'unknown date'

if __name__ == '__main__':
    main()
