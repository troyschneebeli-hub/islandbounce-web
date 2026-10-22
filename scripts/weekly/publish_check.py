#!/usr/bin/env python3
"""Safety gate before publishing. Exit 1 = do NOT publish; keep last week's data.
Usage: publish_check.py --new data/generated-new --old data/generated
"""
import argparse, json, os, sys, collections
ap = argparse.ArgumentParser(); ap.add_argument('--new', required=True); ap.add_argument('--old', required=True)
ap.add_argument('--max-drop', type=float, default=0.30); ap.add_argument('--min-total', type=int, default=120)
a = ap.parse_args(); problems = []
load = lambda d, n: json.load(open(os.path.join(d, n)))
new = load(a.new, 'confirmed-daily-sailings.json')['sailings']; health = load(a.new, 'scan-health.json')
if len(new) < a.min_total: problems.append(f'only {len(new)} confirmed daily sailings (minimum {a.min_total})')
for rk, h in health['routes'].items():
    if h['failed']: problems.append(f'{rk}: {h["failed"]} day(s) failed to load')
    for cap, hd in zip(h['captured'], h['header']):
        if 12 < hd <= 100 and cap < 0.5 * hd: problems.append(f'{rk}: captured {cap} of {hd} trips'); break
oldp = os.path.join(a.old, 'confirmed-daily-sailings.json')
if os.path.exists(oldp):
    old = json.load(open(oldp))['sailings']
    cnt = lambda L: collections.Counter((s['from'], s['to']) for s in L)
    co, cn = cnt(old), cnt(new)
    if len(old) and len(new) < (1 - a.max_drop) * len(old): problems.append(f'total fell from {len(old)} to {len(new)}')
    for rk, n in co.items():
        if n >= 5 and cn.get(rk, 0) < (1 - a.max_drop) * n: problems.append(f'{rk[0]}>{rk[1]} fell from {n} to {cn.get(rk, 0)}')
    key = lambda s: (s['from'], s['to'], s['operator'], s['departs'])
    ko, kn = {key(s) for s in old}, {key(s) for s in new}
    open(os.path.join(a.new, 'diff.md'), 'w').write(f'# Changes vs last run\nAdded: {len(kn-ko)}\nRemoved: {len(ko-kn)}\n\n## Removed\n' + '\n'.join(f'- {k[2]} {k[0]}>{k[1]} {k[3]}' for k in sorted(ko-kn)) + '\n\n## Added\n' + '\n'.join(f'- {k[2]} {k[0]}>{k[1]} {k[3]}' for k in sorted(kn-ko)) + '\n')
if problems:
    print('PUBLISH BLOCKED:'); [print(' -', p) for p in problems]; sys.exit(1)
print('checks passed')
