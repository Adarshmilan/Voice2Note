// --- Meyda Library Check ---
if (typeof Meyda === "undefined") {
    console.error("Meyda library not loaded. Please check the script tag in your HTML file. It should be included before this script.");
} else {
    console.log("Meyda library loaded successfully.");
}

// --- Configuration Constants ---
const A4_FREQUENCY = 440; // The frequency of A4 (standard tuning)
const MIDI_NOTE_A4 = 69;  // MIDI note number for A4
// Array of note names (C, C#, D, etc.) for mapping MIDI numbers to readable notes
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

// --- DOM Elements ---
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const currentNoteDisplay = document.getElementById('current-note');
const pianoKeys = document.querySelectorAll('.key'); // Get all piano key elements

// --- Audio Context and Analyzer Variables ---
let audioContext = null;
let mediaStreamSource = null;
let meydaAnalyzer = null;
let currentStream = null; // To keep track of the active microphone stream

// --- State Variables ---
let previousNoteElement = null; // To keep track of the previously highlighted key for deactivation

// --- Helper Functions ---

/**
 * Converts a frequency (in Hz) to its nearest musical note name (e.g., "A4", "C#5").
 * @param {number} frequency The detected frequency in Hz.
 * @returns {string} The musical note name.
 */
function frequencyToNoteName(frequency) {
    if (frequency === null || frequency < 20 || frequency > 2000) { // Ignore very low/high or null frequencies
        return "--";
    }

    // Calculate MIDI note number using the formula:
    // noteNumber = 12 * log2(frequency / A4_FREQUENCY) + MIDI_NOTE_A4
    const noteNumber = 12 * Math.log2(frequency / A4_FREQUENCY) + MIDI_NOTE_A4;

    // Round to the nearest whole MIDI note number
    const roundedNoteNumber = Math.round(noteNumber);

    // Calculate the octave (MIDI note 60 is C4, 69 is A4)
    // C4 is MIDI note 60, so C0 starts at MIDI note 12 (12 * 0 + 0)
    // (roundedNoteNumber - 12) / 12 gives us the octave number relative to C0
    const octave = Math.floor((roundedNoteNumber / 12) - 1); 

    // Calculate the index within the 12-note scale (0-11)
    const noteIndex = roundedNoteNumber % 12;

    // Return the note name with its octave
    return NOTE_NAMES[noteIndex] + octave;
}

/**
 * Highlights the corresponding key on the virtual piano and updates the note display.
 * Deactivates the previously highlighted key.
 * @param {string} noteName The musical note name (e.g., "C4").
 */
function highlightNoteOnPiano(noteName) {
    // Deactivate the previous key if it exists
    if (previousNoteElement) {
        previousNoteElement.classList.remove('active');
    }

    // Find the current note's key element using its data-note attribute
    const currentNoteElement = document.querySelector(`.key[data-note="${noteName}"]`);

    // Activate the current key if found
    if (currentNoteElement) {
        currentNoteElement.classList.add('active');
        previousNoteElement = currentNoteElement; // Store for next deactivation
    } else {
        // If no key is found for the note (e.g., out of our 2-octave range),
        // ensure no key remains highlighted.
        previousNoteElement = null;
    }

    // Update the text display
    currentNoteDisplay.textContent = noteName;
}

/**
 * Clears the active highlight from all piano keys and resets the note display.
 */
function clearPianoHighlight() {
    if (previousNoteElement) {
        previousNoteElement.classList.remove('active');
        previousNoteElement = null;
    }
    currentNoteDisplay.textContent = "--";
}


// --- Main Logic: Start/Stop Microphone ---

/**
 * Initiates microphone access and starts the pitch detection process.
 */
async function startMicrophone() {
    try {
        // Create or resume the AudioContext in response to a user gesture
        if (!audioContext || audioContext.state === 'closed') {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        // If the context is in a suspended state, it must be resumed
        if (audioContext.state === 'suspended') {
            await audioContext.resume();
        }

        // Request access to the user's microphone
        currentStream = await navigator.mediaDevices.getUserMedia({ audio: true });

        // Create a MediaStreamSource from the microphone stream
        mediaStreamSource = audioContext.createMediaStreamSource(currentStream);

        // Initialize Meyda for pitch detection
        meydaAnalyzer = Meyda.create({
            'audioContext': audioContext,
            'source': mediaStreamSource,
            'bufferSize': 512, // Smaller buffer for lower latency
            'featureExtractors': ['pitch'], // Only extract pitch using the YIN algorithm
            'callback': (features) => {
                // This callback runs repeatedly with pitch features
                const pitch = features.pitch; // The detected fundamental frequency in Hz

                if (pitch && pitch > 0) { // Ensure a valid pitch is detected
                    const noteName = frequencyToNoteName(pitch);
                    highlightNoteOnPiano(noteName);
                } else {
                    // No pitch detected (e.g., silence), clear display
                    clearPianoHighlight();
                }
            }
        });

        // Start the Meyda analyzer
        meydaAnalyzer.start();

        // Update button states
        startButton.disabled = true;
        stopButton.disabled = false;
        console.log("Microphone started and pitch detection active.");

    } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Could not start microphone. Please ensure permissions are granted and no other app is using it.');
        // Ensure buttons are reset if there's an error
        startButton.disabled = false;
        stopButton.disabled = true;
    }
}

/**
 * Stops the microphone input and pitch detection process.
 */
function stopMicrophone() {
    if (meydaAnalyzer) {
        meydaAnalyzer.stop(); // Stop Meyda analysis
        meydaAnalyzer = null;
    }

    if (mediaStreamSource) {
        mediaStreamSource.disconnect(); // Disconnect audio nodes
        mediaStreamSource = null;
    }

    if (currentStream) {
        // Stop all tracks in the media stream (turns off microphone light)
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
    }
    
    if (audioContext && audioContext.state !== 'closed') {
        audioContext.close().then(() => {
            console.log("AudioContext closed.");
            audioContext = null;
        });
    }

    // Clear UI and update button states
    clearPianoHighlight();
    startButton.disabled = false;
    stopButton.disabled = true;
    console.log("Microphone stopped.");
}

// --- Event Listeners ---
startButton.addEventListener('click', startMicrophone);
stopButton.addEventListener('click', stopMicrophone);

// Initially disable the stop button as the mic isn't active
stopButton.disabled = true;

// Optional: Add a listener for when the browser tab loses focus to stop the mic
// This is good practice for privacy and resource management
document.addEventListener('visibilitychange', () => {
    if (document.hidden && meydaAnalyzer && meydaAnalyzer.isRunning) {
        stopMicrophone();
        console.log("Microphone stopped due to tab being hidden.");
    }
});