"""Validate and package the PSSO Modern extension without developer-only files."""
from pathlib import Path
import json, zipfile
ROOT = Path(__file__).resolve().parents[1]
EXT = ROOT / 'extensions' / 'psso-modern'
manifest = json.loads((EXT / 'manifest.json').read_text())
assert manifest['manifest_version'] == 3
assert manifest['permissions'] == ['storage']
assert manifest['content_scripts'][0]['matches'] == ['https://psso.th-koeln.de/qisserver/*']
assert manifest['content_scripts'][0]['world'] == 'ISOLATED'
assert len(manifest['description']) <= 132
files = ['manifest.json','portal.js','portal.css','content.js','styles.css','popup.html','popup.css','privacy.html','review-demo.html','review-demo.css','review-portal.html','review-portal.css','review-portal-demo.js'] + sorted(set(manifest['icons'].values()))
assert set(manifest['content_scripts'][0]['js'] + manifest['content_scripts'][0]['css']).issubset(files)
for name in files:
    assert (EXT / name).is_file(), name
output = ROOT / 'downloads' / 'psso-modern-extension.zip'
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as package:
    for name in files: package.write(EXT / name, name)
with zipfile.ZipFile(output) as package:
    assert package.testzip() is None
    assert 'manifest.json' in package.namelist()
print(f'Extension {manifest["version"]}: {len(files)} files, {output.stat().st_size} bytes. Output: {output}')
