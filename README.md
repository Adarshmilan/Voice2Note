# 🎶 Voice2Note

![HTML](https://img.shields.io/badge/HTML-5-orange?logo=html5)
![CSS](https://img.shields.io/badge/CSS-3-blue?logo=css3)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6-yellow?logo=javascript)
![Web Audio API](https://img.shields.io/badge/Web%20API-Audio-green)
![Responsive](https://img.shields.io/badge/Responsive-Mobile%20Friendly-brightgreen)

---

## 📌 Overview
**Voice2Note** is a real-time **pitch detection and vocal practice tool** built entirely with **HTML, CSS, and JavaScript**.  

It captures your voice using the **microphone**, analyzes the sound frequency, converts it to the nearest **musical note**, and highlights the corresponding **key on a virtual piano** in real time.  

---

## ✨ Features
- 🎤 Real-time **voice pitch detection**  
- 🎹 Interactive **piano keyboard** (up to 3 octaves)  
- 📱 Fully **responsive**:  
  - Mobile → 1 Octave  
  - Tablet → 2 Octaves  
  - Desktop → 3 Octaves  
- 🎶 Displays **note name** + **frequency (Hz)**  
- 🌐 100% **browser-based** (no installation needed)  

---

## 🛠️ Tech Stack
- **Frontend** → HTML, CSS (with gradients, flexbox/grid, responsive design)  
- **JavaScript** →  
  - Web Audio API → microphone input & audio analysis  
  - **Autocorrelation method** → pitch detection  
  - **Formula for note conversion**  

---

## 🧮 Formula Used
To map a detected frequency `f` into a note number (MIDI scale):

```text
noteNumber = 12 × log2(frequency / 440) + 69
