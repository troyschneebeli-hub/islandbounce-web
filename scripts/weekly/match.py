#!/usr/bin/env python3
"""Compare 12Go scans (7 days) with operator timetables.
Usage: match.py --scans out/ --operators data/operator-sailings.json --out data/generated/
Confirmed = same operator + same route pair + departure within 10 min on BOTH lists
(operator's time, 12Go's lowest A$ price). Daily = seen on every scanned day.
"""
import argparse, glob, json, os, collections

PORT_NAMES = {'bangsal':'Bangsal (Lombok)','benoa-nusa-dua':'Benoa / Nusa Dua','gili-air':'Gili Air','gili-meno':'Gili Meno',
  'gili-trawangan':'Gili Trawangan','nusa-lembongan':'Nusa Lembongan','nusa-penida':'Nusa Penida','padang-bai':'Padang Bai',
  'sanur':'Sanur','serangan':'Serangan'}
ALIASES = [('wijaya buyuk','wb'),('semaya','semaya'),('wahana','wahana'),('nusa nadhi','nadhi'),('waterjet','waterjet'),('tanis','tanis'),
 ('bluewater','bw'),('wijaya tramena','wt'),('gili gili','gg'),('eka','eka'),('golden queen','gq'),('scoot','scoot'),('arthamas','arth'),
 ('angkal','angkal'),('angel','angel'),('waruna','waruna'),('arjuna','arjuna'),('maruti','maruti'),('el rey','elrey'),('semabu','semabu'),
 ('axe','axe'),('ocean speed','ocean'),('caspla','caspla'),('marina','marina'),('gili getaway','getaway'),('camel','dcamel'),
 ('stars','dstars'),('dream beach','dream'),('rocky','rocky'),('sanjaya','sanjaya'),('karunia','karunia'),('starfish','starfish'),
 ('gili trans','gte'),('bali triptop','triptop'),('gili dewata','dewata'),('ostina','ostina'),('nusa trans','ntl'),
 ('express bali','ebt'),('glory','glory'),('bali line','baliline')]

def opkey(n):
    n = (n or '').lower().replace("'", '').replace('’', '')
    for k, v in ALIASES:
        if k in n: return v
    return n
def mins(s):
    h, m = s.split(':'); return int(h) * 60 + int(m)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--scans', required=True); ap.add_argument('--operators', required=True); ap.add_argument('--out', required=True)
    ap.add_argument('--window', type=int, default=7, help='days expected in the scan'); ap.add_argument('--tol', type=int, default=10)
    ap.add_argument('--min-days', type=int, default=None, help='days a sailing must be seen to count as daily (default: window)')
    ap.add_argument('--allow-missed', type=int, default=1,
                    help="nights a sailing may be missing (sold out on 12Go, or the route didn't load) and still count as daily, "
                         "but only when the operator's own timetable says it runs daily")
    a = ap.parse_args()
    min_days = a.min_days or a.window

    scans = [json.load(open(f)) for f in sorted(glob.glob(os.path.join(a.scans, 'scan-*.json')))]
    dates = [s['date'] for s in scans]
    if len(dates) != a.window: raise SystemExit(f'expected {a.window} scan files, found {len(dates)}: {dates}')
    ops = json.load(open(a.operators))

    # 12Go listings: key (from,to,opkey,dep) -> days seen + min price
    G = {}
    health = {'dates': dates, 'routes': {}}
    loaded = collections.defaultdict(set)  # (from, to) -> indexes of the days the route loaded
    for si, s in enumerate(scans):
        for rk, r in s['routes'].items():
            h = health['routes'].setdefault(rk, {'captured': [], 'header': [], 'failed': 0, 'empty': 0, 'errors': []})
            h['captured'].append(r['captured']); h['header'].append(r['header']); h['failed'] += r['failed']; h['empty'] += r['empty']
            if r.get('error'): h['errors'].append(f"{s['date']}: {r['error']}")
            f, t = rk.split('>')
            if not r['failed']: loaded[(f, t)].add(si)
            for x in r['sailings']:
                if (x['op'] or '').startswith(('Ferry #', 'Taxi #')): continue
                k = (f, t, opkey(x['op']), x['dep'])
                g = G.setdefault(k, {'from': f, 'to': t, 'twelvegoOperator': x['op'], 'dep': x['dep'], 'arr': x.get('arr'), 'days': set(), 'price': None})
                g['days'].add(si)
                if x['price'] is not None and (g['price'] is None or x['price'] < g['price']): g['price'] = x['price']

    by_route = collections.defaultdict(list)
    for o in ops: by_route[(o['from'], o['to'], opkey(o['operator']))].append(o)

    confirmed, g_only, used = {}, [], set()
    for k, g in G.items():
        best = None
        for i, o in enumerate(by_route.get((g['from'], g['to'], k[2]), [])):
            d = abs(mins(o['dep']) - mins(g['dep']))
            if d <= a.tol and (best is None or d < best[0]): best = (d, o)
        if best:
            o = best[1]; used.add(id(o))
            ck = (g['from'], g['to'], o['operator'], o['dep'])
            c = confirmed.setdefault(ck, {'operator': o['operator'], 'twelvegoOperator': g['twelvegoOperator'], 'from': g['from'], 'to': g['to'],
                'fromName': PORT_NAMES[g['from']], 'toName': PORT_NAMES[g['to']], 'departs': o['dep'], 'twelvegoDeparts': g['dep'],
                'checkIn': o.get('checkIn'), 'arrives': o.get('arr'), 'twelvegoArrives': g['arr'], 'operatorSource': o.get('source'),
                'operatorDays': o.get('days'), 'priceAUD': g['price'], 'daysSeen': set()})
            c['daysSeen'] |= g['days']
            if g['price'] is not None and (c['priceAUD'] is None or g['price'] < c['priceAUD']): c['priceAUD'] = g['price']
        else:
            g_only.append({'operator': g['twelvegoOperator'], 'from': g['from'], 'to': g['to'], 'fromName': PORT_NAMES[g['from']],
                           'toName': PORT_NAMES[g['to']], 'departs': g['dep'], 'arrives': g['arr'], 'priceAUD': g['price'], 'daysSeen': sorted(g['days'])})
    conf = []
    for c in confirmed.values():
        c['daysSeen'] = sorted(c['daysSeen'])
        # Daily = seen on every night of the window. When the operator's own timetable says the sailing runs daily,
        # allow_missed nights may be missing: 12Go hides sold-out trips, and a route can fail to load. Without that
        # statement a missing night could be a day the boat doesn't run (e.g. no Sunday service), so all nights count.
        seen = len(set(c['daysSeen']) & loaded[(c['from'], c['to'])])
        op_daily = (c.get('operatorDays') or '').strip().lower().startswith('daily')
        c['runsDaily'] = seen >= min_days or (op_daily and seen >= min_days - a.allow_missed)
        conf.append(c)
    conf.sort(key=lambda c: (c['from'], c['to'], c['departs']))
    g_only.sort(key=lambda c: (c['from'], c['to'], c['departs']))
    daily = [c for c in conf if c['runsDaily']]
    op_only = [o for o in ops if id(o) not in used]

    os.makedirs(a.out, exist_ok=True)
    # generatedAt = the latest check: the window holds one scan per weekday, made on different nights.
    meta = {'scannedDates': sorted(dates), 'generatedAt': max(s['scannedAt'] for s in scans),
            'dailyRule': f"seen on all {min_days} nights, or {min_days - a.allow_missed} when the operator's timetable says daily"}
    for name, rows in [('confirmed-sailings', conf), ('confirmed-daily-sailings', daily), ('twelvego-only-sailings', g_only)]:
        json.dump({**meta, 'sailings': rows}, open(os.path.join(a.out, name + '.json'), 'w'), indent=1, ensure_ascii=False)
    json.dump(health, open(os.path.join(a.out, 'scan-health.json'), 'w'), indent=1)
    lines = [f"# Weekly timetable run", f"Window: {dates[0]} to {dates[-1]}", '',
             f"- 12Go listings: {len(G)}", f"- Confirmed (on both): {len(conf)}", f"- Confirmed daily (shown on Fast Routes): {len(daily)}",
             f"- 12Go only (Trip Planner, typical): {len(g_only)}", f"- Operator only (not shown): {len(op_only)}",
             f"- Route-days that failed to load: {sum(h['failed'] for h in health['routes'].values())}"]
    errors = [f"  - {rk} {e}" for rk, h in sorted(health['routes'].items()) for e in h['errors']]
    if errors: lines += ['', 'Load errors (first 20):'] + errors[:20]
    open(os.path.join(a.out, 'report.md'), 'w').write('\n'.join(lines) + '\n')
    print('\n'.join(lines))

if __name__ == '__main__': main()
