import csv, json

# ---------- data harian (day.csv) -> data.js ----------
rows = []
with open('day.csv', newline='') as f:
    for r in csv.DictReader(f):
        rows.append(dict(
            d=r['dteday'],
            s=int(r['season']),
            y=2011 + int(r['yr']),
            m=int(r['mnth']),
            w=int(r['workingday']),
            t=round(float(r['atemp']) * 50, 2),
            h=round(float(r['hum']) * 100, 1),
            c=int(r['casual']),
            r=int(r['registered']),
            n=int(r['cnt']),
        ))

with open('data.js', 'w') as f:
    f.write('const DAY_DATA = ' + json.dumps(rows, separators=(',', ':')) + ';\n')
print(len(rows), 'baris ditulis ke data.js')

# ---------- data per jam (hour.csv) -> data_hour.js ----------
# Diringkas per (tahun, musim, hari kerja, jam) supaya file kecil.
# k = jumlah jam yang dirata-ratakan, c/r/n = total casual/registered/semua.
agg = {}
with open('hour.csv', newline='') as f:
    for r in csv.DictReader(f):
        key = (2011 + int(r['yr']), int(r['season']), int(r['workingday']), int(r['hr']))
        a = agg.setdefault(key, dict(y=key[0], s=key[1], w=key[2], h=key[3], k=0, c=0, r=0, n=0))
        a['k'] += 1
        a['c'] += int(r['casual'])
        a['r'] += int(r['registered'])
        a['n'] += int(r['cnt'])

with open('data_hour.js', 'w') as f:
    f.write('const HOUR_DATA = ' + json.dumps(list(agg.values()), separators=(',', ':')) + ';\n')
print(len(agg), 'baris ringkasan ditulis ke data_hour.js')