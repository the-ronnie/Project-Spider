document.addEventListener('DOMContentLoaded', function () {
    // Selecting elements
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreview = document.getElementById('image-preview');
    const selectedImagesContainer = document.getElementById('selected-image-container');
    const previewButton = document.getElementById('preview-button');
    const videoPreview = document.getElementById('video-preview');
    const videoPreviewContainer = document.getElementById('video-preview-container');
    const uploadSection = document.getElementById('upload-section');
    const musicUploadButton = document.querySelector('.upload-music-button');
    const backgroundMusicInput = document.getElementById('background-music');
    const timeline = document.getElementById('timeline');
    const loginButton = document.getElementById('login-button');
    

    // Event listeners
    loginButton.addEventListener('click', function () {
        loginButton.classList.toggle('show-dropdown');
    });
    

    
    document.getElementById('download-button').addEventListener('click', function() {
        window.location = '/download';
    });

    // Fetch current user information
    function getCurrentUser() {
        fetch('/current_user')
            .then(response => response.json())
            .then(data => {
                const username = data.username;
                if (username) {
                    // Update UI to display current user's information
                    const dropdownMenu = document.getElementById('dropdown-menu');
                    dropdownMenu.innerHTML = `
                        <div class="user-info">
                            <svg class="user-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 14l7-4m7 4V5l-7 4-7-4v9l7 4 7-4z" />
                            </svg>
                        </div>
                        <span class="username">${username}</span>
                        <span id="logout-button"><a href="/" style="color: black;">Logout</a></span>
                    `;
                } else {
                    // Update UI to display login button
                    document.getElementById('login-button').innerHTML = 'Login';
                    document.getElementById('login-button').setAttribute('href', '/');
                }
            })
            .catch(error => console.error('Error fetching current user:', error));
    }


    // Call getCurrentUser when the page loads
    getCurrentUser();

    // Update image preview on file selection
    imageUploadInput.addEventListener('change', handleImageUpload);

    // Preview the video on button click
    // previewButton.addEventListener('click', previewVideo);

    // Add drag-and-drop functionality
    uploadSection.addEventListener('dragover', handleDragOver);
    uploadSection.addEventListener('drop', handleFileDrop);

    // Upload music on button click
    musicUploadButton.addEventListener('click', function () {
        backgroundMusicInput.click(); // Trigger file input click event
    });

    // Handle music upload
    backgroundMusicInput.addEventListener('change', function () {
        const musicFile = backgroundMusicInput.files[0];
        if (musicFile) {
            console.log('Selected music file:', musicFile);
            // Perform further processing or upload to server
            // For example, you can use the Fetch API to send the file to a server
            // Replace 'uploadMusic.php' with the appropriate URL of your server-side script
            const formData = new FormData();
            formData.append('musicFile', musicFile);

            fetch('uploadMusic.php', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Music file uploaded successfully');
                        // Handle successful upload
                    } else {
                        console.error('Failed to upload music file');
                        // Handle upload failure
                    }
                })
                .catch(error => {
                    console.error('Error uploading music file:', error);
                    // Handle upload error
                });
        } else {
            console.error('No music file selected');
        }
    });

    // Functions

    // Update image preview on file selection
    imageUploadInput.addEventListener('change', handleImageUpload);

    // Function to handle image upload
    function handleImageUpload() {
        const files = imageUploadInput.files;
        const formData = new FormData();

        for (const file of files) {
            formData.append('file', file);
        }

        fetch('/upload_image', {
            method: 'POST',
            body: formData,
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    console.log('Image uploaded successfully');
                    handleFiles(files); //To Show images at same time
                    // You can perform additional actions here after successful image upload
                } else {
                    console.error('Failed to upload image:', data.message);
                    // Handle upload failure
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                // Handle upload error
            });
    }
    

    // Handle file upload for images
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

            // Appending elements to the image container
            imgContainer.appendChild(img);
            imgContainer.appendChild(selectCheckbox);
            imgContainer.appendChild(removeButton);
            imagePreview.appendChild(imgContainer);
        }
    }

    // Handle image selection
    // function handleImageSelection(event) {
    //     const checkbox = event.target;
    //     const imageName = checkbox.value;
    //     const imageContainer = checkbox.parentElement;

    //     if (checkbox.checked) {
    //         const selectedImage = imageContainer.cloneNode(true);
    //         selectedImage.querySelector('.remove-button').remove();
    //         selectedImage.classList.remove('image-container');
    //         selectedImage.classList.add('selected-image-container');
    //         const closeButton = document.createElement('button');
    //         closeButton.classList.add('close-button');
    //         closeButton.textContent = 'X';
    //         closeButton.addEventListener('click', () => {
    //             selectedImage.remove();
    //         });
    //         selectedImage.appendChild(closeButton);
    //         selectedImagesContainer.appendChild(selectedImage);
    //     } else {
    //         const selectedImage = selectedImagesContainer.querySelector(`[value="${imageName}"]`);
    //         if (selectedImage) {
    //             selectedImage.remove();
    //         }
    //     }
    // }
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    let select_images=[];
    let transitionsArray = [];
    function handleImageSelection(event) {
        const checkbox = event.target;
        const imageContainer = checkbox.closest('.image-container');

        if (checkbox.checked) {
            // Perform actions when an image is selected
            console.log('Image selected:', imageContainer.querySelector('img').src);
            addImageToTimeline(imageContainer.querySelector('img').src);

            const image_url=imageContainer.querySelector('img').src;
            
            select_images.push(image_url);

        } else {
            // Perform actions when an image is deselected
            console.log('Image deselected:', imageContainer.querySelector('img').src);
            removeImageFromTimeline(imageContainer.querySelector('img').src);

            const index = select_images.indexOf(imageContainer.querySelector('img').src);
            if (index !== -1) {
                select_images.splice(index, 1);
            }
        }
        // displayImages();
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //displaying the images for trail
    // function displayImages() {
    //     var prashant = document.getElementById('collect-image');
    //     prashant.innerHTML = ''; // Clear previous images
    //     select_images.forEach(image_url => {
    //         var image = document.createElement('img');
    //         image.setAttribute("src", image_url);
    //         prashant.appendChild(image);
    //     });
    // }
    // Function to add an image to the timeline
    function addImageToTimeline(imageSrc) {
        const timeline = document.getElementById('timeline');
        const imageElement = document.createElement('img');
        imageElement.src = imageSrc;
        imageElement.classList.add('timeline-image');
        timeline.appendChild(imageElement);
        
        // Add the selected image to the "selectedImage" folder
        saveSelectedImage(imageSrc);
    }


// Function to remove an image from the timeline
    function removeImageFromTimeline(imageSrc) {
        const timelineImages = document.querySelectorAll('.timeline-image');
        timelineImages.forEach(image => {
            if (image.src === imageSrc) {
                image.remove();
                // Remove the selected image from the "selectedImage" folder
                deleteSelectedImage(imageSrc);
            }
        });
    }

// Function to save selected image to the "selectedImage" folder
    function saveSelectedImage(imageSrc) {
        // Send a request to the server to save the image in the "selectedImage" folder
        fetch('/save_selected_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageSrc: imageSrc })
        })
        .then(response => {
            if (!response.ok) {
                console.error('Failed to save selected image');
            }
        })
        .catch(error => {
            console.error('Error saving selected image:', error);
        });
    }

// Function to delete selected image from the "selectedImage" folder
    function deleteSelectedImage(imageSrc) {
        // Send a request to the server to delete the image from the "selectedImage" folder
        fetch('/delete_selected_image', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ imageSrc: imageSrc })
        })
        .then(response => {
            if (!response.ok) {
                console.error('Failed to delete selected image');
            }
        })
        .catch(error => {
            console.error('Error deleting selected image:', error);
        });
    }


    // Event listener to handle image selection
    //This is the function which looks for change in Selection and calls another function to handle Image Selection 
    function setupImageSelection() {
        const checkboxes = document.querySelectorAll('.image-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', handleImageSelection);
        });
    }

    // Call the setupImageSelection function when the page loads
    setupImageSelection();
    let selectMusicSrc = null;
    function handleMusicSelection(event) {
        const checkbox = event.target;
        const musicContainer = checkbox.closest('.music-container');
        console.log('musicContainer:', musicContainer);
        const musicSrc = musicContainer.querySelector('#ad source').src;
        selectMusicSrc = musicSrc;
        console.log(musicSrc);
        // addMusicToPlaylist(musicContainer);
        // if (checkbox.checked) {
        //     // Perform actions when a music is selected
        //     console.log('Music selected:', musicContainer.querySelector('audio').src);
            
        //     // Store the music source
        //     selectMusicSrc = musicSrc;
        // } else {
        //     // Perform actions when a music is deselected
        //     console.log('Music deselected:', musicContainer.querySelector('audio').src);
        //     removeMusicFromPlaylist(musicContainer);
        //      // Clear the selected music source
        //     selectMusicSrc = null;
        // }
    }

    // Function to add music to the playlist and timeline
    function addMusicToPlaylist(musicContainer) {
        const playlist = document.getElementById('playlist');
        const timeline = document.getElementById('timeline');

        // Create a new audio element for the playlist
        const musicElement = document.createElement('audio');
        const src = musicContainer.querySelector('audio').src;
        musicElement.src = src;
        musicElement.controls = true;
        musicElement.classList.add('playlist-audio');
        playlist.appendChild(musicElement);

        // Create a new div for the timeline
        const timelineMusic = document.createElement('div');
        timelineMusic.classList.add('timeline-music');
        timelineMusic.textContent = musicContainer.querySelector('.music-name').textContent;
        timeline.appendChild(timelineMusic);
    }

    // Function to remove music from the playlist and timeline
    function removeMusicFromPlaylist(musicContainer) {
        const playlist = document.getElementById('playlist');
        const timeline = document.getElementById('timeline');

        // Remove the audio element from the playlist
        const src = musicContainer.querySelector('audio').src;
        const playlistMusic = playlist.querySelector(`audio[src="${src}"]`);
        if (playlistMusic) {
            playlistMusic.remove();
        }

        // Remove the music from the timeline
        const timelineMusic = timeline.querySelector(`.timeline-music:contains("${musicContainer.querySelector('.music-name').textContent}")`);
        if (timelineMusic) {
            timelineMusic.remove();
        }
    }

    // Event listener to handle music selection
    function setupMusicSelection() {
        const musicButtons = document.querySelectorAll('#selectMusic');
        musicButtons.forEach(button => {
            button.addEventListener('click', handleMusicSelection);
        });  
    }

    // Call the setupMusicSelection function when the page loads
    setupMusicSelection();

   // Function to handle music selection from the library
   function handleMusicLibrarySelection(event) {
    const musicContainer = event.target.closest('.music-container');
    const selectedButton = event.target.closest('.select-music-button');
    
    if (selectedButton) {
        const musicName = musicContainer.querySelector('.music-name').textContent;
        addMusicToTimeline(musicName);
    }
}

// Function to add music to the timeline
function handleMusicLibrarySelection(event) {
    const musicContainer = event.target.closest('.music-container');
    const selectedButton = event.target.closest('.select-music-button');function handleMusicSelection(event) {
        const checkbox = event.target;
        const musicContainer = checkbox.closest('.music-container');

        if (checkbox.checked) {
            // Perform actions when a music is selected
            console.log('Music selected:', musicContainer.querySelector('audio').src);
            addMusicToPlaylist(musicContainer);
        } else {
            // Perform actions when a music is deselected
            console.log('Music deselected:', musicContainer.querySelector('audio').src);
            removeMusicFromPlaylist(musicContainer);
        }
    }}
function addMusicToTimeline(musicName) {
    const timeline = document.getElementById('timeline');

    // Create a new div for the timeline
    const timelineMusic = document.createElement('div');
    timelineMusic.classList.add('timeline-music');
    timelineMusic.textContent = musicName;

    // Create a remove button for the music item
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-music-button');
    removeButton.addEventListener('click', () => {
        timelineMusic.remove();
    });

    // Append remove button to timeline music item
    timelineMusic.appendChild(removeButton);

    // Append music item to timeline
    timeline.appendChild(timelineMusic);
}

// Event listener to handle music selection from the library
function setupMusicLibrarySelection() {
    const musicLibrary = document.querySelector('.music-library');
    musicLibrary.addEventListener('click', handleMusicLibrarySelection);
}

// Call the setupMusicLibrarySelection function when the page loads
setupMusicLibrarySelection();


// select_images changes done////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Preview video
async function previewVideo() {
    let response = await fetch('/process-images', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ select_images: select_images })
    });
        
    let data = await response.json();
    console.log('Response from server:', data);
    return data;
}

// async function previewThevideo(){
//     const vid=document.getElementById("video-preview");
//     const vd=vid.querySelector(source);
//     vd.src="/final_video.mp4";
// }

async function sendTransitionsToPython() {
    const data = { transitionsArray: transitionsArray };
    console.log(data)
    let response = await fetch('/process_transitions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    let responseData = await response.json();
    console.log(responseData.message); // Log server response

    if (response.ok) {
        document.getElementById('video-preview').src = responseData.outputVideoSrc;
    } else {
        console.error('Error:', responseData.error);
    }
}
async function sendAudio() {
    console.log(selectMusicSrc);
    if (!selectMusicSrc) {
        console.error("No music selected!");
        return;
    }

    let response = await fetch('/process-music', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ selectMusicSrc })
    });

    let responseData = await response.json();
    console.log(responseData.message); // Log server response

    if (!response.ok) {
        throw new Error('Failed to send music to server');
    }
}

async function handlePreviewButtonClick() {
    try {
        await previewVideo();
        await sendTransitionsToPython();
        await sendAudio();
        // await previewThevideo();
    } catch (error) {
        console.error('An error occurred:', error);
    }
}




// Attach event listener to the preview button
document.getElementById('preview-button').addEventListener('click', handlePreviewButtonClick);  // i have a little doubt over here


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        


    // Handle drag over for file drop
    function handleDragOver(event) {
        event.preventDefault();
        uploadSection.classList.add('drag-over');
    }

    // Function to handle file drop
    function handleFileDrop(event) {
        event.preventDefault();
        uploadSection.classList.remove('drag-over');
        const files = event.dataTransfer.files;
        handleFiles(files);
        // Upload dropped files to the server
        uploadFiles(files);
    }

    // Function to upload dropped files to the server
function uploadFiles(files) {
    const formData = new FormData();
    for (const file of files) {
        formData.append('file', file);
    }
    fetch('/upload_image', {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            console.log('Files uploaded successfully');
            // You can perform additional actions here after successful upload
        } else {
            console.error('Failed to upload files');
            // Handle upload failure
        }
    })
    .catch(error => {
        console.error('Error uploading files:', error);
        // Handle upload error
    });
}

    // Variable to keep track of the next clip ID
    let nextClipId = 1;

    // Function to add a new video clip to the timeline
    function addClip() {
        // Create a new <div> element for the video clip
        const clip = document.createElement('div');
        clip.className = 'video-clip'; // Add the CSS class for styling
        clip.innerText = `Clip ${nextClipId}`; // Set the text content of the clip
        clip.style.left = '10px'; // Set initial horizontal position
        clip.style.top = '50px'; // Set initial vertical position
        timeline.appendChild(clip); // Append the clip to the timeline container

        // Make the clip draggable
        makeDraggable(clip);

        nextClipId++; // Increment the clip ID for the next clip
    }

    // Function to make an element draggable
    function makeDraggable(element) {
        let offsetX, offsetY;
        let dragging = false;

        // Event listener to handle mouse down event for starting dragging
        element.addEventListener('mousedown', function (e) {
            dragging = true;
            // Calculate the offset of the mouse pointer relative to the element's position
            offsetX = e.clientX - element.getBoundingClientRect().left;
            offsetY = e.clientY - element.getBoundingClientRect().top;
        });

        // Event listener to handle mouse move event for dragging
        document.addEventListener('mousemove', function (e) {
            if (dragging) {
                // Calculate the new position of the element based on the mouse position and offset
                element.style.left = `${e.clientX - offsetX}px`;
                element.style.top = `${e.clientY - offsetY}px`;
            }
        });

        // Event listener to handle mouse up event for stopping dragging
        document.addEventListener('mouseup', function () {
            dragging = false;
        });
    }


    // Event listener to handle click on the add clip button
    // document.getElementById('add-clip-btn').addEventListener('click', addClip);

// Function to handle transition selection

function handleTransitionSelection(event) {
    const transitionContainer = event.target.closest('.transition-container');
    const selectButton = event.target.closest('.select-transition-button');
    
    if (selectButton.click) {
        console.log("Clicked")
        const transitionImg = transitionContainer.querySelector('img').src;
        addTransitionToTimeline(transitionImg);
 /////////////////// to make array of transition name. i am doing changes from here only//////////////////////////////////////////////////////////////////////////////
        const transitionName = getTransitionName(transitionImg);
        addTransition(transitionName);
    }
}
function getTransitionName(transitionImg) {
    // Get the filename from the image source
    const filename = transitionImg.substring(transitionImg.lastIndexOf('/') + 1);
    // Remove the file extension
    const transitionName = filename.substring(0, filename.lastIndexOf('.'));
    console.log(transitionName);
    return transitionName;
}

function addTransition(transitionName) {
    transitionsArray.push(transitionName);
    console.log(transitionsArray); // For debugging, we can remove this line later
}
// until here i have made changes for making an array of name of transitions selected so that i can use them in python for video making////////////////////////////////////////

// Function to add transition to the timeline
function addTransitionToTimeline(transitionImg) {
    const timeline = document.getElementById('timeline');

    // Create a new div for the timeline
    const timelineTransition = document.createElement('div');

    const transitionImage=document.createElement('img');
    transitionImage.src=transitionImg;
    timelineTransition.classList.add('timeline-transition');
    timelineTransition.appendChild(transitionImage);

    // Create a remove button for the transition item
    const removeButton = document.createElement('button');
    removeButton.textContent = 'Remove';
    removeButton.classList.add('remove-transition-button');
    removeButton.addEventListener('click', () => {
        timelineTransition.remove();
    });

    // Append remove button to timeline transition item
    timelineTransition.appendChild(removeButton);

    // Append transition item to timeline
    timeline.appendChild(timelineTransition);
}

// Event listener to handle transition selection
function setupTransitionSelection() {
    const transitionSection = document.getElementById('transition-section');
    transitionSection.addEventListener('click', handleTransitionSelection);
}

// Call the setupTransitionSelection function when the page loads
setupTransitionSelection();

//Javascript for searching
const searchInput=document.querySelector("[data-search]")
searchInput.addEventListener("input",e=>{
    const value=e.target.value;
    const divElem=document.querySelectorAll('.music-container');
    for(let Elem of divElem){
        const musicName=Elem.querySelector('.music-name');
        console.log(musicName.textContent);
        const isMatch=musicName.textContent.toLowerCase().includes(value.toLowerCase());
        Elem.classList.toggle("hide",!isMatch);
        // if(musicName.textContent.toLowerCase().includes(value.toLowerCase())){
        //     Elem.style.display="block";
        // }else{
        //     Elem.style.display="none";
        // }
    }
})

var videoElement = document.getElementById('video-preview');

// Create a URL for the blob
var videoUrl = URL.createObjectURL();

// Set the video source to this URL
videoElement.src = videoUrl;


});
