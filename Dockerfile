FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies required by OpenCV and rembg
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Pre-download the U^2-Net model so it's baked into the image
# This ensures Hugging Face doesn't timeout when starting
RUN python -c "from rembg import new_session; new_session('u2net')"

# Copy the entire project (backend and frontend)
COPY . .

# Set working directory to backend so relative paths (../frontend) work perfectly
WORKDIR /app/backend

# Hugging Face Spaces exposes port 7860 by default
EXPOSE 7860

# Start the FastAPI server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
