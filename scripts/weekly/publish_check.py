#!/usr/bin/env python3
"""Safety gate before publishing. Exit 1 = do NOT publish; keep the last published data.
Usage: publish_check.py --new data/generated-new --old data/generated [--baseline window/baseline]
--old is the last published data (normally last night's); --baseline is the published data from about a week ago,
so a slow slide (a little lost every night) is caught too, not only a big drop in one night.
"""
import argparse, json, os, sys, collections
ap = argparse.ArgumentParser(); ap.add_argument('--new', required=True); ap.add_argument('--old', required=True)
ap.add_argument('--baseline', default=None)
ap.add_argument('--max-drop', type=float, default=0.30); ap.add_argument('--min-total', type=int, default=120)
# A route that failed to load on more than this many nights (with no recent reading to fall back on) can't be judged.
ap.add_argument('--max-missing', type=int, default=1)
a = ap.parse_args(); problems = []
load = lambda d, n: json.load(open(os.path.join(d, n)))
# The daily list the route pages show: daily-sailings.json (every bookable daily boat, from 24 Oct 2026), or the
# confirmed daily file in data published before that.
daily_path = lambda d: next((os.path.join(d, n) for n in ('daily-sailings.json', 'confirmed-daily-sailings.json') if os.path.exists(os.path.join(d, n))), None)
new = json.load(open(daily_path(a.new)))['sailings']; health = load(a.new, 'scan-health.json')
if len(new) < a.min_total: problems.append(f'only {len(new)} daily sailings (minimum {a.min_total})')
for rk, h in health['routes'].items():
    if h['failed'] > a.max_missing: problems.append(f'{rk}: {h["failed"]} night(s) failed to load ({"; ".join(h.get("errors", [])[:2])})')
    for cap, hd in zip(h['captured'], h['header']):
        if 12 < hd <= 100 and cap < 0.5 * hd: problems.append(f'{rk}: captured {cap} of {hd} trips'); break

cnt = lambda L: collections.Counter((s['from'], s['to']) for s in L)
def drops(old, label):
    co, cn = cnt(old), cnt(new)
    if len(old) and len(new) < (1 - a.max_drop) * len(old): problems.append(f'total fell from {len(old)} to {len(new)} {label}')
    for rk, n in co.items():
        if n >= 5 and cn.get(rk, 0) < (1 - a.max_drop) * n: problems.append(f'{rk[0]}>{rk[1]} fell from {n} to {cn.get(rk, 0)} {label}')

oldp = daily_path(a.old)
if oldp:
    old = json.load(open(oldp))['sailings']
    drops(old, 'since the last update')
    key = lambda s: (s['from'], s['to'], s['operator'], s['departs'])
    ko, kn = {key(s) for s in old}, {key(s) for s in new}
    open(os.path.join(a.new, 'diff.md'), 'w').write(f'# Changes vs last run\nAdded: {len(kn-ko)}\nRemoved: {len(ko-kn)}\n\n## Removed\n' + '\n'.join(f'- {k[2]} {k[0]}>{k[1]} {k[3]}' for k in sorted(ko-kn)) + '\n\n## Added\n' + '\n'.join(f'- {k[2]} {k[0]}>{k[1]} {k[3]}' for k in sorted(kn-ko)) + '\n')
basep = daily_path(a.baseline) if a.baseline else None
if basep:
    base = json.load(open(basep))
    drops(base['sailings'], f"since the weekly reference ({base.get('referenceDate', 'about a week ago')})")
if problems:
    print('PUBLISH BLOCKED:'); [print(' -', p) for p in problems]; sys.exit(1)
print('checks passed')
