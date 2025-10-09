const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const noteDisplay = document.getElementById("note-display");
const freqDisplay = document.getElementById("frequency-display");
const piano = document.getElementById("piano");

let audioContext, analyser, bufferLength, dataArray, source;
let animationId;
let pianoKeys = [];

const NOTES = ["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];

function buildPiano() {
  const screenWidth = window.innerWidth;
  let startOctave, endOctave;

  if (screenWidth < 640) { 
    startOctave = 4;
    endOctave = 4;
  } else if (screenWidth < 1024) { 
    startOctave = 3;
    endOctave = 4;
  } else { 
    startOctave = 3;
    endOctave = 6;
  }

  for (let octave = startOctave; octave <= endOctave; octave++) {
    NOTES.forEach(note => {
      const key = document.createElement("div");
      key.classList.add("key");
      key.classList.add(note.includes("#") ? "black" : "white");
      key.dataset.note = note + octave;
      key.innerText = key.dataset.note; 
      piano.appendChild(key);
      pianoKeys.push(key);
    });
  }
}

startBtn.addEventListener("click", async () => {
  if (!audioContext) audioContext = new AudioContext();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  source = audioContext.createMediaStreamSource(stream);

  analyser = audioContext.createAnalyser();
  analyser.fftSize = 2048;
  bufferLength = analyser.fftSize;
  dataArray = new Float32Array(bufferLength);

  source.connect(analyser);

  detectPitch();

  startBtn.classList.add("hidden");
  stopBtn.classList.remove("hidden");
});

stopBtn.addEventListener("click", () => {
  if (source) {
    source.disconnect();
  }
  cancelAnimationFrame(animationId);
  noteDisplay.textContent = "Note: --";
  freqDisplay.textContent = "Frequency: -- Hz";
  highlightKey(null);

  startBtn.classList.remove("hidden");
  stopBtn.classList.add("hidden");
});

/* Pitch Detection (Autocorrelation) */
function autoCorrelate(buffer, sampleRate) {
  let SIZE = buffer.length;
  let rms = 0;
  for (let i = 0; i < SIZE; i++) {
    let val = buffer[i];
    rms += val * val;
  }
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.01) return -1;

  let r1 = 0, r2 = SIZE - 1, thres = 0.2;
  for (let i = 0; i < SIZE/2; i++) if (Math.abs(buffer[i]) < thres) { r1 = i; break; }
  for (let i = 1; i < SIZE/2; i++) if (Math.abs(buffer[SIZE-i]) < thres) { r2 = SIZE-i; break; }
  buffer = buffer.slice(r1, r2); SIZE = buffer.length;

  let c = new Array(SIZE).fill(0);
  for (let i = 0; i < SIZE; i++)
    for (let j = 0; j < SIZE - i; j++)
      c[i] = c[i] + buffer[j] * buffer[j+i];

  let d = 0; while (c[d] > c[d+1]) d++;
  let maxval = -1, maxpos = -1;
  for (let i = d; i < SIZE; i++) if (c[i] > maxval) { maxval = c[i]; maxpos = i; }
  return sampleRate / maxpos;
}

/* Frequency → Note */
function frequencyToNote(frequency) {
  const A4 = 440;
  const noteNumber = 12 * (Math.log(frequency / A4) / Math.log(2)) + 69;
  return Math.round(noteNumber);
}
function noteName(noteNumber) {
  const noteNames = NOTES;
  return noteNames[noteNumber % 12] + Math.floor(noteNumber / 12 - 1);
}

/* Highlight Key */
function highlightKey(note) {
  pianoKeys.forEach(key => {
    if (key.dataset.note === note) key.classList.add("active");
    else key.classList.remove("active");
  });
}

/* Detection Loop */
function detectPitch() {
  analyser.getFloatTimeDomainData(dataArray);
  const pitch = autoCorrelate(dataArray, audioContext.sampleRate);

  if (pitch !== -1) {
    const noteNum = frequencyToNote(pitch);
    const note = noteName(noteNum);
    noteDisplay.textContent = "Note: " + note;
    freqDisplay.textContent = "Frequency: " + pitch.toFixed(2) + " Hz";
    highlightKey(note);
  }
  animationId = requestAnimationFrame(detectPitch);
}

window.onload = buildPiano;

window.addEventListener("resize", () => {
  location.reload(); // simple approach, reload UI
});
