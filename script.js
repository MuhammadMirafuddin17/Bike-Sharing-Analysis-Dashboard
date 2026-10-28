// Data berasal dari data.js (hasil konversi day.csv): DAY_DATA
// Field: d=tanggal, s=musim, y=tahun, m=bulan, w=hari kerja, t=atemp(°C), h=hum(%), c=casual, r=registered, n=total

Chart.defaults.color = '#9ca3af';
Chart.defaults.borderColor = '#374151';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const SEASONS = { 1: 'Spring', 2: 'Summer', 3: 'Fall', 4: 'Winter' };
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0') + ':00');
const SEASON_COLORS = ['#fbbf24', '#34d399', '#60a5fa', '#f472b6'];
const YEAR_COLORS = { 2011: '#34d399', 2012: '#60a5fa' };

const fmt = n => Math.round(n).toLocaleString('id-ID');
const sum = (arr, key) => arr.reduce((a, r) => a + r[key], 0);
const setText = (id, text) => { document.getElementById(id).textContent = text; };

const axis = (x, y) => ({
    x: { title: { display: !!x, text: x } },
    y: { title: { display: !!y, text: y }, beginAtZero: true }
});
const baseOpts = (x, y, legend = false) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: legend } },
    scales: axis(x, y)
});

const charts = {};

function initCharts() {
    const ctx = id => document.getElementById(id).getContext('2d');

    charts.monthly = new Chart(ctx('monthlyChart'), {
        type: 'line',
        data: { labels: MONTHS, datasets: [] },
        options: baseOpts('Bulan', 'Jumlah Penyewaan', true)
    });

    charts.user = new Chart(ctx('casualRegChart'), {
        type: 'doughnut',
        data: { labels: ['Casual', 'Registered'], datasets: [{ data: [0, 0], backgroundColor: ['#f87171', '#34d399'], borderColor: '#1f2937' }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });

    charts.season = new Chart(ctx('seasonChart'), {
        type: 'bar',
        data: { labels: Object.values(SEASONS), datasets: [{ label: 'Total Penyewaan', data: [], backgroundColor: SEASON_COLORS }] },
        options: baseOpts('Musim', 'Jumlah Penyewaan')
    });

    charts.work = new Chart(ctx('workingDayChart'), {
        type: 'bar',
        data: { labels: ['Akhir Pekan / Libur', 'Hari Kerja'], datasets: [{ label: 'Total Penyewaan', data: [], backgroundColor: ['#fbbf24', '#38bdf8'] }] },
        options: baseOpts('Kategori Hari', 'Jumlah Penyewaan')
    });

    charts.temp = scatterChart(ctx('tempChart'), '#a78bfa', 'Suhu terasa (°C)');
    charts.hum = scatterChart(ctx('humChart'), '#f472b6', 'Kelembapan (%)');

    charts.hour = new Chart(ctx('hourChart'), {
        type: 'line',
        data: {
            labels: HOURS,
            datasets: [
                { label: 'Total', data: [], borderColor: '#f9fafb', backgroundColor: '#f9fafb', tension: 0.3 },
                { label: 'Registered', data: [], borderColor: '#34d399', backgroundColor: '#34d399', tension: 0.3 },
                { label: 'Casual', data: [], borderColor: '#f87171', backgroundColor: '#f87171', tension: 0.3 }
            ]
        },
        options: baseOpts('Jam (0–23)', 'Rata-rata penyewaan per jam', true)
    });
}

function scatterChart(context, color, xLabel) {
    return new Chart(context, {
        type: 'scatter',
        data: {
            datasets: [
                { label: 'Data harian', data: [], backgroundColor: color + '99', pointRadius: 3 },
                { type: 'line', label: 'Garis regresi', data: [], borderColor: '#f9fafb', borderWidth: 2, pointRadius: 0 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } },
            scales: axis(xLabel, 'Penyewaan per hari')
        }
    });
}

// Regresi linier sederhana: y = slope * x + intercept, plus korelasi Pearson (r)
function regression(points) {
    const n = points.length;
    if (n < 2) return null;
    const mx = points.reduce((a, p) => a + p.x, 0) / n;
    const my = points.reduce((a, p) => a + p.y, 0) / n;
    let sxy = 0, sxx = 0, syy = 0;
    points.forEach(p => {
        sxy += (p.x - mx) * (p.y - my);
        sxx += (p.x - mx) ** 2;
        syy += (p.y - my) ** 2;
    });
    if (sxx === 0 || syy === 0) return null;
    const slope = sxy / sxx;
    return { slope, intercept: my - slope * mx, r: sxy / Math.sqrt(sxx * syy) };
}

function strength(r) {
    const a = Math.abs(r);
    return a >= 0.7 ? 'kuat' : a >= 0.4 ? 'sedang' : 'lemah';
}

function getFilters() {
    const read = sel => Array.from(document.querySelectorAll(sel + ':checked')).map(cb => Number(cb.value));
    return { years: read('.filter-year'), seasons: read('.filter-season'), workdays: read('.filter-workingday') };
}

function updateDashboard() {
    const f = getFilters();
    const data = DAY_DATA.filter(r => f.years.includes(r.y) && f.seasons.includes(r.s) && f.workdays.includes(r.w));
    const empty = data.length === 0;
    document.getElementById('emptyNotice').classList.toggle('hidden', !empty);

    // Kartu statistik
    const total = sum(data, 'n');
    setText('stat-records', `${fmt(data.length)} Hari`);
    setText('stat-total', `${fmt(total)} Unit`);
    setText('stat-avg', `${fmt(empty ? 0 : total / data.length)} Unit / Hari`);

    updateMonthly(data, f.years);
    updateUser(data);
    updateSeason(data);
    updateWork(data);
    updateScatter(charts.temp, 'ins-temp', data, 't', '°C', 'suhu terasa');
    updateScatter(charts.hum, 'ins-hum', data, 'h', '%', 'kelembapan');
    updateScatter(charts.hum, 'ins-hum', data, 'h', '%', 'kelembapan');
    updateHour(f);
}

function updateMonthly(data, years) {
    const datasets = years.slice().sort().map(y => ({
        label: String(y),
        data: MONTHS.map((_, i) => {
            const rows = data.filter(r => r.y === y && r.m === i + 1);
            return rows.length ? sum(rows, 'n') : null; // null = tidak ada data (tidak digambar sebagai 0)
        }),
        borderColor: YEAR_COLORS[y], backgroundColor: YEAR_COLORS[y], tension: 0.3
    }));
    charts.monthly.data.datasets = datasets;
    charts.monthly.update();

    if (!data.length) return setText('ins-monthly', 'Tidak ada data.');
    const byMonth = MONTHS.map((_, i) => sum(data.filter(r => r.m === i + 1), 'n'));
    const peak = byMonth.indexOf(Math.max(...byMonth));
    let text = `Bulan dengan penyewaan tertinggi: ${MONTHS[peak]} (${fmt(byMonth[peak])} unit).`;
    const t11 = sum(data.filter(r => r.y === 2011), 'n');
    const t12 = sum(data.filter(r => r.y === 2012), 'n');
    if (years.length === 2 && t11 > 0) {
        text += ` Total 2012 ${t12 >= t11 ? 'naik' : 'turun'} ${Math.abs((t12 / t11 - 1) * 100).toFixed(1)}% dibanding 2011 (pada filter yang dipilih).`;
    }
    setText('ins-monthly', text);
}

function updateUser(data) {
    const c = sum(data, 'c'), r = sum(data, 'r');
    charts.user.data.datasets[0].data = [c, r];
    charts.user.update();
    setText('ins-user', c + r > 0
        ? `Pengguna registered mendominasi dengan ${(r / (c + r) * 100).toFixed(1)}% (${fmt(r)} unit), casual ${(c / (c + r) * 100).toFixed(1)}% (${fmt(c)} unit).`
        : 'Tidak ada data.');
}

function updateSeason(data) {
    const totals = [1, 2, 3, 4].map(s => sum(data.filter(r => r.s === s), 'n'));
    charts.season.data.datasets[0].data = totals;
    charts.season.update();
    const max = Math.max(...totals);
    setText('ins-season', max > 0
        ? `Musim terbanyak: ${SEASONS[totals.indexOf(max) + 1]} (${fmt(max)} unit). Spring biasanya paling sepi.`
        : 'Tidak ada data.');
}

function updateWork(data) {
    const off = data.filter(r => r.w === 0), on = data.filter(r => r.w === 1);
    charts.work.data.datasets[0].data = [sum(off, 'n'), sum(on, 'n')];
    charts.work.update();
    if (!data.length) return setText('ins-work', 'Tidak ada data.');
    const avg = rows => rows.length ? fmt(sum(rows, 'n') / rows.length) : '-';
    setText('ins-work', `Total hari kerja lebih besar karena jumlah harinya lebih banyak. Rata-rata per hari: hari kerja ${avg(on)} unit, libur ${avg(off)} unit.`);
}

function updateScatter(chart, insightId, data, key, unit, name) {
    const points = data.map(r => ({ x: r[key], y: r.n }));
    chart.data.datasets[0].data = points;
    const reg = regression(points);
    if (reg) {
        const xs = points.map(p => p.x);
        const x1 = Math.min(...xs), x2 = Math.max(...xs);
        chart.data.datasets[1].data = [{ x: x1, y: reg.slope * x1 + reg.intercept }, { x: x2, y: reg.slope * x2 + reg.intercept }];
        const dir = reg.r >= 0 ? 'positif' : 'negatif';
        setText(insightId, `Korelasi ${dir} ${strength(reg.r)} (r = ${reg.r.toFixed(2)}). Setiap kenaikan ${name} 1${unit} berasosiasi dengan ${reg.slope >= 0 ? 'tambahan' : 'penurunan'} sekitar ${fmt(Math.abs(reg.slope))} penyewaan per hari. Korelasi tidak berarti sebab-akibat.`);
    } else {
        chart.data.datasets[1].data = [];
        setText(insightId, 'Data tidak cukup untuk menghitung regresi.');
    }
    chart.update();
}

function updateHour(f) {
    const rows = HOUR_DATA.filter(r => f.years.includes(r.y) && f.seasons.includes(r.s) && f.workdays.includes(r.w));
    // rata-rata per jam = total penyewaan / jumlah jam pengamatan
    const avg = key => HOURS.map((_, h) => {
        const g = rows.filter(r => r.h === h);
        const k = sum(g, 'k');
        return k ? sum(g, key) / k : null;
    });
    const total = avg('n');
    charts.hour.data.datasets[0].data = total;
    charts.hour.data.datasets[1].data = avg('r');
    charts.hour.data.datasets[2].data = avg('c');
    charts.hour.update();

    const vals = total.filter(v => v !== null);
    if (!vals.length) return setText('ins-hour', 'Tidak ada data.');
    const peak = total.indexOf(Math.max(...vals));
    const low = total.indexOf(Math.min(...vals));
    let text = `Jam tersibuk: ${HOURS[peak]} (rata-rata ${fmt(total[peak])} unit/jam). Jam tersepi: ${HOURS[low]} (${fmt(total[low])} unit/jam).`;
    if (f.workdays.length === 1 && f.workdays[0] === 1) {
        text += ' Pada hari kerja terlihat dua puncak (pagi dan sore) yang sesuai jam berangkat dan pulang kerja.';
    } else if (f.workdays.length === 1) {
        text += ' Pada akhir pekan/libur, penyewaan menumpuk di siang hingga sore, tanpa puncak jam kerja.';
    }
    setText('ins-hour', text);
}

document.addEventListener('DOMContentLoaded', () => {
    initCharts();
    document.querySelectorAll('.filter-year, .filter-season, .filter-workingday')
        .forEach(input => input.addEventListener('change', updateDashboard));
    document.getElementById('resetFilter').addEventListener('click', () => {
        document.querySelectorAll('aside input[type=checkbox]').forEach(cb => cb.checked = true);
        updateDashboard();
    });

    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('show', window.scrollY > 300);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    updateDashboard();
});