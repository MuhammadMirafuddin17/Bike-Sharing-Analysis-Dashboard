# Bike-Sharing-Analysis-Dashboard

# 🚴 Bike Sharing Analysis Dashboard

Dashboard interaktif untuk menganalisis pola penyewaan sepeda pada tahun 2011–2012. Seluruh grafik, angka, dan insight dihitung langsung dari data dan ikut berubah mengikuti filter yang dipilih.

🔗 **Demo online:** https://bike-sharing-analysis-dashboard.netlify.app

## Fitur

- **Filter interaktif** berdasarkan tahun, musim, dan kategori hari (hari kerja / akhir pekan & libur), plus tombol *Reset Filter*.
- **Kartu statistik**: jumlah hari, total penyewaan, dan rata-rata penyewaan harian.
- **7 grafik** yang semuanya terhubung ke filter yang sama:
  1. Total penyewaan per bulan dan tahun
  2. Casual vs Registered
  3. Total penyewaan per musim
  4. Hari kerja vs libur
  5. Suhu terasa (atemp) vs penyewaan, dengan garis regresi
  6. Kelembapan (hum) vs penyewaan, dengan garis regresi
  7. Pola penyewaan rata-rata per jam
- **Insight otomatis** di bawah setiap grafik yang dihitung ulang setiap filter berubah.
- Tombol kembali ke atas dan tampilan responsif (dark mode).

## Dataset

Dataset yang dipakai adalah **Bike Sharing Dataset** (sistem Capital Bikeshare, Washington D.C., 2011–2012).

| File | Isi | Jumlah baris |
|------|-----|--------------|
| `day.csv` | Data penyewaan per hari | 731 |
| `hour.csv` | Data penyewaan per jam | 17.379 |

Beberapa kolom yang dipakai: `season`, `yr`, `mnth`, `hr`, `workingday`, `atemp`, `hum`, `casual`, `registered`, `cnt`.

## Temuan utama

- Total penyewaan selama 2 tahun: **3.292.679 unit** (rata-rata sekitar 4.504 unit per hari).
- Penyewaan tahun 2012 naik sekitar **65%** dibanding 2011.
- Pengguna **registered** mendominasi, yaitu sekitar **81%** dari total.
- Musim **Fall** memiliki penyewaan terbanyak, sedangkan **Spring** paling sedikit.
- Rata-rata penyewaan per hari relatif mirip antara hari kerja (sekitar 4.585) dan libur (sekitar 4.330).
- Suhu terasa berkorelasi positif sedang dengan penyewaan (**r ≈ 0,63**), sedangkan kelembapan hanya berkorelasi negatif lemah (**r ≈ -0,10**).
- Pada hari kerja terlihat dua puncak penyewaan, yaitu sekitar pukul **08.00** dan **17.00**, yang sesuai jam berangkat dan pulang kerja.

> Korelasi hanya menunjukkan hubungan antar variabel, bukan sebab-akibat.

## Teknologi

- HTML, CSS, dan JavaScript
- [Tailwind CSS](https://tailwindcss.com/) untuk tampilan
- [Chart.js](https://www.chartjs.org/) untuk grafik
- Python (hanya untuk menyiapkan data)
- Hosting: Netlify

## Struktur file

```
├── index.html     # Halaman utama dan susunan dashboard
├── script.js      # Logika filter, perhitungan, dan grafik
├── style.css      # Gaya tambahan (kotak insight, tombol kembali ke atas)
├── data.js        # Data harian (dibuat dari day.csv)
├── data_hour.js   # Ringkasan data per jam (dibuat dari hour.csv)
└── data.py        # Skrip pembuat data.js dan data_hour.js
```

## Cara menjalankan

1. Unduh atau clone repository ini.
2. Buka `index.html` di browser. Perlu koneksi internet karena Tailwind dan Chart.js dimuat dari CDN.

Kalau memakai VS Code, bisa juga dibuka lewat ekstensi **Live Server**.

## Memperbarui data

Dashboard membaca `data.js` dan `data_hour.js`, bukan file CSV secara langsung. Kalau data CSV berubah, buat ulang kedua file itu:

```bash
python3 data.py
```

Pastikan `day.csv` dan `hour.csv` berada di lokasi yang sesuai dengan yang dibaca `data.py`, lalu muat ulang halaman.

## Pembuat

**Muhammad Mirafuddin**
