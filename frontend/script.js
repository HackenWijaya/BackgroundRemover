document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const uploadContent = document.getElementById('upload-content');
    const loadingState = document.getElementById('loading-state');
    const resultArea = document.getElementById('result-area');
    
    const originalImage = document.getElementById('original-image');
    const resultImage = document.getElementById('result-image');
    
    const btnReset = document.getElementById('btn-reset');
    const btnDownload = document.getElementById('btn-download');

    let currentResultBlob = null;

    // Drag and drop events
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropZone.addEventListener(eventName, () => {
            dropZone.classList.remove('dragover');
        }, false);
    });

    // Handle dropped file
    dropZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // Handle selected file via button
    fileInput.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFile(this.files[0]);
        }
    });

    function handleFile(file) {
        // Check if it's an image
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }

        // Show preview of original
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImage.src = e.target.result;
        }
        reader.readAsDataURL(file);

        // Upload and process
        processImage(file);
    }

    async function processImage(file) {
        // UI transitions
        uploadContent.classList.add('hidden');
        loadingState.classList.remove('hidden');

        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/remove-bg', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Server returned an error');
            }

            const blob = await response.blob();
            currentResultBlob = blob;
            
            const objectUrl = URL.createObjectURL(blob);
            resultImage.src = objectUrl;

            // UI transitions
            dropZone.classList.add('hidden');
            resultArea.classList.remove('hidden');

        } catch (error) {
            console.error('Error processing image:', error);
            alert('Failed to process image. Please try again.');
            resetUI();
        } finally {
            loadingState.classList.add('hidden');
        }
    }

    // Download logic
    btnDownload.addEventListener('click', () => {
        if (!currentResultBlob) return;
        
        const url = URL.createObjectURL(currentResultBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'removed_background.png';
        document.body.appendChild(a);
        a.click();
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 100);
    });

    // Reset logic
    btnReset.addEventListener('click', resetUI);

    function resetUI() {
        fileInput.value = '';
        currentResultBlob = null;
        
        resultArea.classList.add('hidden');
        dropZone.classList.remove('hidden');
        uploadContent.classList.remove('hidden');
        loadingState.classList.add('hidden');
    }
});
