let cameraInput;
let capturedImage;
let extractedTextElement;
let harmfulIngredientsData = {}; // To store harmful ingredients data

// Load the harmful ingredients JSON data
fetch('ingredients.json')
    .then(response => response.json())
    .then(data => {
        harmfulIngredientsData = data.harmfulIngredients; // Store the harmful ingredients
    })
    .catch(error => {
        console.error("Error loading ingredients JSON:", error);
    });

function setup() {
    noCanvas(); // We don't need a canvas for the video feed
    extractedTextElement = document.getElementById('extracted-text');
}

window.onload = function () {
    const startButton = document.getElementById('start-button');
    const homeScreen = document.getElementById('home-screen');
    const scannerScreen = document.getElementById('scanner-screen');

    startButton.addEventListener('click', () => {
        // Hide home screen and show scanner screen
        homeScreen.style.display = 'none';
        scannerScreen.style.display = 'block';
        startCamera();
    });

    const foodPairingButton = document.getElementById('food-pairing-button');
    foodPairingButton.addEventListener('click', () => {
        // Implement food pairing functionality here
        alert("Food Pairing feature coming soon!");
    });
};

function startCamera() {
    cameraInput = createCapture(VIDEO);
    cameraInput.size(400, 300);
    cameraInput.parent('video-container'); // Attach video to a div in HTML

    // Move the event listener bindings for buttons inside this function
    const scanButton = document.getElementById('scan-button');
    const editButton = document.getElementById('edit-button');
    const saveButton = document.getElementById('save-button');

    if (scanButton) {
        scanButton.addEventListener('click', () => {
            captureImage();
        });
    } else {
        console.error("Scan button not found!");
    }

    if (editButton) {
        editButton.addEventListener('click', () => {
            enableEditing();
        });
    } else {
        console.error("Edit button not found!");
    }

    if (saveButton) {
        saveButton.addEventListener('click', () => {
            saveChanges();
        });
    } else {
        console.error("Save button not found!");
    }
}

function captureImage() {
    // Create a canvas to capture a frame from the video feed
    let captureCanvas = createGraphics(400, 300);
    captureCanvas.image(cameraInput, 0, 0, 400, 300);

    // Show the captured image
    let capturedImageDiv = document.getElementById('captured-image');
    capturedImageDiv.innerHTML = ''; // Clear previous image
    let imageElement = createImg(captureCanvas.canvas.toDataURL(), "Captured Image");
    capturedImageDiv.appendChild(imageElement.elt);

    // Perform text extraction
    extractTextFromImage(captureCanvas.canvas);
}

function extractTextFromImage(imageCanvas) {
    // Using Tesseract.js to extract text from the captured image
    Tesseract.recognize(imageCanvas, 'eng', { logger: m => console.log(m) })
        .then(result => {
            const extractedText = result.data.text;
            displayExtractedText(extractedText);
            checkHarmfulIngredients(extractedText); // Check for harmful ingredients
        })
        .catch(error => {
            console.error("Error during text extraction:", error);
        });
}

function displayExtractedText(text) {
    extractedTextElement.value = text; // Set the value of the textarea to the extracted text
}

function checkHarmfulIngredients(extractedText) {
    // Split the extracted text into words
    const words = extractedText.split(/\s+/); // Split by whitespace
    const foundDiseases = new Set(); // Use a Set to avoid duplicates

    words.forEach(word => {
        const trimmedWord = word.trim().toLowerCase(); // Trim and convert to lower case
        if (harmfulIngredientsData[trimmedWord]) {
            const diseases = harmfulIngredientsData[trimmedWord].diseases;
            diseases.forEach(disease => foundDiseases.add(disease)); // Add diseases to the Set
        }
    });

    // Display the found diseases
    const diseasesDiv = document.getElementById('diseases');
    if (foundDiseases.size > 0) {
        diseasesDiv.innerText = "Harmful ingredients detected! Potential diseases: " + Array.from(foundDiseases).join(", ");
    } else {
        diseasesDiv.innerText = "No harmful ingredients detected.";
    }
}

function enableEditing() {
    const textarea = document.getElementById('extracted-text');
    textarea.readOnly = false; // Make the textarea editable
    document.getElementById('edit-button').style.display = 'none'; // Hide edit button
    document.getElementById('save-button').style.display = 'inline'; // Show save button
}

function saveChanges() {
    const textarea = document.getElementById('extracted-text');
    const editedText = textarea.value; // Get the edited text

    // Save the edited text to local storage
    localStorage.setItem('editedExtractedText', editedText);

    textarea.readOnly = true; // Make the textarea non-editable
    document.getElementById('edit-button').style.display = 'inline'; // Show edit button again
    document.getElementById('save-button').style.display = 'none'; // Hide save button

    checkHarmfulIngredients(editedText); // Check for harmful ingredients in the edited text
}
