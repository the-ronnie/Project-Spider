document.addEventListener('DOMContentLoaded', function () {
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const selectedImagesSection = document.getElementById('selected-images');
    const previewButton = document.getElementById('preview-button');
    const videoPreview = document.getElementById('video-preview');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const uploadSection = document.getElementById('upload-section');

    // Update image preview on file selection
    imageUploadInput.addEventListener('change', handleImageUpload);

    // Preview the video on button click
    previewButton.addEventListener('click', previewVideo);

    // Add drag-and-drop functionality
    uploadSection.addEventListener('dragover', handleDragOver);
    uploadSection.addEventListener('drop', handleFileDrop);

    function handleImageUpload() {
        const files = imageUploadInput.files;
        handleFiles(files);
    }

    function handleFiles(files) {
        for (const file of files) {
            const imgContainer = document.createElement('div');
            imgContainer.classList.add('image-container');

            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.alt = file.name;

            const selectCheckbox = document.createElement('input');
            selectCheckbox.type = 'checkbox';
            selectCheckbox.name = 'selected-image';
            selectCheckbox.value = file.name;
            selectCheckbox.addEventListener('change', handleImageSelection);

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.classList.add('remove-button');
            removeButton.addEventListener('click', () => {
                imgContainer.remove();
            });

            imgContainer.appendChild(img);
            imgContainer.appendChild(selectCheckbox);
            imgContainer.appendChild(removeButton);
            imagePreview.appendChild(imgContainer);
        }
    }

    function handleImageSelection(event) {
        const checkbox = event.target;
        const imageName = checkbox.value;
        const imageContainer = checkbox.parentElement;
        
        if (checkbox.checked) {
            const selectedImage = imageContainer.cloneNode(true);
            selectedImage.querySelector('.remove-button').remove(); // Remove the remove button
            selectedImage.classList.remove('image-container');
            selectedImage.classList.add('selected-image-container');
            const closeButton = document.createElement('button');
            closeButton.classList.add('close-button');
            closeButton.textContent = 'X';
            closeButton.addEventListener('click', () => {
                selectedImage.remove();
            });
            selectedImage.appendChild(closeButton);
            selectedImagesSection.appendChild(selectedImage);
        } else {
            const selectedImage = selectedImagesSection.querySelector(`[value="${imageName}"]`);
            if (selectedImage) {
                selectedImage.remove();
            }
        }
    }

    function previewVideo() {
        // Set the source of the video
        videoPreview.src = 'your-video-file.mp4';
    
        // Display the video container
        videoPreviewContainer.style.display = 'block';
    
        // Autoplay the video
        videoPreview.autoplay = true;
        videoPreview.load(); // Load the video to start autoplay
    }

    function handleDragOver(event) {
        event.preventDefault();
        uploadSection.classList.add('drag-over');
    }

    function handleFileDrop(event) {
        event.preventDefault();
        uploadSection.classList.remove('drag-over');

        const files = event.dataTransfer.files;
        handleFiles(files);
    }
});
