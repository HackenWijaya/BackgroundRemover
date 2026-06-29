import io # Modul bawaan Python untuk menangani data berbentuk byte (input/output)
from fastapi import FastAPI, File, UploadFile # Mengimpor framework FastAPI untuk membuat server dan menangani file upload
from fastapi.responses import Response # Mengimpor Response untuk mengembalikan data byte gambar secara langsung ke klien
from fastapi.staticfiles import StaticFiles # Mengimpor StaticFiles untuk menyajikan file frontend (HTML, CSS, JS)
from fastapi.middleware.cors import CORSMiddleware # Middleware untuk mengizinkan akses dari domain berbeda (CORS)
from rembg import remove, new_session # Mengimpor library utama (rembg) yang mengeksekusi model U^2-Net
from PIL import Image # Library untuk pemrosesan gambar (opsional, untuk manipulasi lanjutan jika diperlukan)

# 1. Inisialisasi Aplikasi
# Membuat instance aplikasi FastAPI. Ini adalah fondasi dari server web kita.
app = FastAPI(title="BgRemove API by Hacken Wijaya")

# 2. Pengaturan Keamanan (CORS)
# Mengizinkan frontend (antarmuka web) untuk berkomunikasi dengan backend API ini.
# Tanda "*" berarti mengizinkan koneksi dari sumber mana saja.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Mendefinisikan Rute API (Endpoint)
# Membuat endpoint POST di URL '/api/remove-bg'. Saat fungsi JavaScript melakukan fetch, data dikirim ke sini.
@app.post("/api/remove-bg")
async def remove_background(image: UploadFile = File(...)):
    # 3.1 Membaca Gambar Masukan
    # Menunggu dan membaca seluruh data byte dari gambar yang diunggah oleh pengguna
    contents = await image.read()
    
    # 3.2 Menyiapkan Model Kecerdasan Buatan (AI)
    # Memuat file model arsitektur U^2-Net ("u2net.onnx") ke dalam memori komputer.
    # Ini memastikan secara spesifik bahwa proses penghapusan menggunakan neural network U^2-Net.
    model_session = new_session("u2net")
    
    # 3.3 Pemrosesan Gambar (Inferensi AI)
    # Gambar mentah (contents) dimasukkan ke dalam jaringan U^2-Net.
    # Model akan memprediksi saliency map, menghapus latar belakang, dan mengembalikan hasilnya (byte gambar).
    output_bytes = remove(contents, session=model_session)
    
    # 3.4 Mengirimkan Hasil ke Pengguna
    # Mengembalikan gambar yang sudah transparan ke browser dengan tipe "image/png".
    # Penggunaan format PNG sangat mutlak agar area transparan (alpha channel) tidak diisi warna solid.
    return Response(content=output_bytes, media_type="image/png")

# 4. Menyajikan Antarmuka Web (Frontend)
# Mengarahkan pengunjung URL utama ("/") ke folder frontend kita sehingga file index.html otomatis ditampilkan.
# Ini memungkinkan FastAPI berfungsi ganda: sebagai server AI (Backend) dan web server UI (Frontend).
app.mount("/", StaticFiles(directory="../frontend", html=True), name="frontend")
