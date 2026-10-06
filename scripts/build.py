"""Validate local links and assemble this static site's deployment directory."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import shutil

ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, text):
        super().__init__(); self.ids = []; self.refs = []; self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs: self.ids.append(attrs['id'])
        for key in ('href', 'src'):
            if key in attrs: self.refs.append(attrs[key])

pages = {f: Page(f.read_text()) for f in ROOT.glob('*.html')}
errors = []
for file, page in pages.items():
    if len(page.ids) != len(set(page.ids)): errors.append(f'{file.name}: duplicate IDs')
    for ref in page.refs:
        url = urlsplit(ref)
        if url.scheme or url.netloc: continue
        target = (ROOT / unquote(url.path.lstrip('/'))) if url.path.startswith('/') else file.parent / unquote(url.path)
        if not url.path: target = file
        if target.is_dir(): target /= 'index.html'
        if not target.exists() and not target.suffix: target = target.with_suffix('.html')
        if not target.exists(): errors.append(f'{file.name}: missing {ref}')
        elif url.fragment and target in pages and unquote(url.fragment) not in pages[target].ids:
            errors.append(f'{file.name}: missing anchor {ref}')
if errors: raise SystemExit('\n'.join(errors))
destination = ROOT / 'dist'
# Copy only public site assets, never repository metadata, tests, or source tools.
for file in ROOT.glob('*.html'):
    destination.mkdir(exist_ok=True); shutil.copy2(file, destination / file.name)
for name in ['css', 'js', 'img']:
    shutil.copytree(ROOT / name, destination / name, dirs_exist_ok=True)
for name in ['robots.txt', 'sitemap.xml', 'anas-jabaly.vcf', 'netlify.toml', 'vercel.json']:
    shutil.copy2(ROOT / name, destination / name)
print(f'Build OK: {len(pages)} HTML pages; local assets and anchors validated. Output: {destination}')
