# 🎶 Voice2Note – Documentation

## 1. Introduction

Voice2Note is a web-based pitch detection and vocal practice tool. It captures live audio from the microphone, analyzes the frequency of the incoming signal, maps it to the nearest musical note, and highlights the corresponding key on a virtual piano keyboard.

This project was built entirely with HTML, CSS, and JavaScript, making it lightweight, responsive, and easy to use across devices (desktop, tablet, mobile).

## 2. Objectives

- To provide real-time pitch detection from microphone input.
- To convert the detected frequency into a musical note.
- To display the detected note visually on a virtual piano UI.
- To make the application responsive:
  - Show 1 octave on mobile, 2 octaves on tablets, and 3+ octaves on desktops.
- To provide an engaging and interactive practice environment for singers and musicians.

## 3. System Architecture

### Flow of the Application

1.  **Microphone Access**

    - Browser asks for microphone permission using `navigator.mediaDevices.getUserMedia()`.
    - Captures live audio in real time.

2.  **Audio Processing**

    - Audio stream is sent to Web Audio API.
    - An `AnalyserNode` + `Float32Array` is used to fetch frequency domain data.
    - A pitch detection algorithm (autocorrelation) extracts the fundamental frequency.

3.  **Frequency → Note Conversion**

    - The following formula maps the frequency to the closest MIDI note number:
      ```
      noteNumber = 12 × log2(frequency / 440 Hz) + 69
      ```
    - Each note number is mapped to standard note names (C, C#, D … B).

4.  **Piano Visualization**

    - Virtual piano keys are generated dynamically using JavaScript DOM manipulation.
    - Number of octaves is chosen based on screen width:
      - `<640px` → 1 octave
      - `<1024px` → 2 octaves
      - `Otherwise` → 3 octaves

5.  **UI Update**
    - The detected note highlights the corresponding piano key.
    - The highlight is removed once the note changes.

## 4. Technology Stack

- **Frontend**:
  - **HTML**: Structure of the page.
  - **CSS**: Piano layout, responsive styling, and glossy UI design using flexbox and gradients.
- **JavaScript**:
  - **Web Audio API**: Capturing and analyzing audio signals.
  - **Pitch Detection Function**: Autocorrelation-based algorithm.
  - **DOM Manipulation**: Rendering piano keys and handling highlight effects.

## 5. Code Breakdown

### 5.1 HTML (Structure)

- Container for the piano.
- Buttons to start/stop microphone access.
- Display area to show the detected note name and frequency.

### 5.2 CSS (UI & Styling)

- Piano keys styled to resemble a real piano (white and black keys).
- Glossy effect using gradients and shadows.
- Responsive layout using Flexbox to ensure keys scale with screen size.

### 5.3 JavaScript (Core Logic)

**a) Microphone Setup**

```javascript
navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
  const audioContext = new AudioContext();
  const source = audioContext.createMediaStreamSource(stream);
  const analyser = audioContext.createAnalyser();
  source.connect(analyser);
});
```

**b) Pitch Detection Algorithm**

- Uses autocorrelation to find repeating waveforms in the audio signal.
- This helps in finding the fundamental frequency of the voice.

**c) Frequency → Note Conversion**

```javascript
function frequencyToNoteNumber(frequency) {
  return Math.round(12 * Math.log2(frequency / 440) + 69);
}
```

**d) Piano Rendering**

- Keys are generated in a loop over the desired octaves.
- The number of octaves is responsive:
  ```javascript
  if (screenWidth < 640) {
    startOctave = 4;
    endOctave = 4; // Mobile
  } else if (screenWidth < 1024) {
    startOctave = 3;
    endOctave = 4; // Tablet
  } else {
    startOctave = 3;
    endOctave = 5; // Desktop
  }
  ```

**e) Note Highlighting**

- When a note is detected, the corresponding key gets an `active` CSS class.
- When the pitch changes, the previous key’s highlight is removed.

## 6. Responsiveness

- Implemented using screen width checks in JavaScript to determine the number of piano octaves.
- The piano layout is built with flexbox, so it adjusts to the container width naturally.

## 7. Advantages

✅ Works directly in the browser – no installation required.  
✅ Real-time detection with low latency.  
✅ Responsive piano that adjusts to the screen size.  
✅ Glossy, realistic piano UI.  
✅ Easy to extend (e.g., add an accuracy meter, recording history, etc.).

## 8. Limitations

⚠️ Accuracy depends on microphone quality.  
⚠️ Background noise can cause false detections.  
⚠️ Limited frequency range, primarily optimized for the human singing voice.

## 9. Applications

🎤 Vocal practice for singers.  
🎶 Music education for students learning scales and notes.  
🎹 Basic instrument tuning.  
📱 A mobile-friendly practice app on the go.

## 10. Conclusion

Voice2Note successfully demonstrates a real-time vocal pitch detection system within a browser. By combining signal processing, music theory, and responsive UI design, it provides a practical and accessible tool for musicians and vocalists of all levels.
