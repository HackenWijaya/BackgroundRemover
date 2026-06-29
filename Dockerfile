FROM python:3.10-slim

# 1. Hugging Face Spaces Wajib Menggunakan Non-Root User (Keamanan)
# Membuat user bernama "user" dengan ID 1000 (standar HF)
RUN useradd -m -u 1000 user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    U2NET_HOME=/home/user/.u2net

# Pindah ke folder app di dalam folder user
WORKDIR $HOME/app

# 2. Instalasi Library Sistem Operasi (Untuk OpenCV)
USER root
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*
RUN chown -R user:user $HOME/app

# 3. Kembali ke Non-Root User untuk menjalankan sisa perintah
USER user

# 4. Instalasi Python Dependencies
COPY --chown=user:user backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# 5. Pre-download Model U^2-Net agar tidak lemot saat jalan pertama kali
# Model akan disimpan di /home/user/.u2net karena kita set U2NET_HOME di atas
RUN python -c "from rembg import new_session; new_session('u2net')"

# 6. Salin semua file kode ke dalam Docker (Backend & Frontend)
COPY --chown=user:user . .

# 7. Pengaturan Jalur & Port untuk FastAPI
WORKDIR $HOME/app/backend
EXPOSE 7860

# 8. Perintah Menyalakan Server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
