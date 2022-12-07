class WaveGenerator {
  #audioContext = new (window.AudioContext || window.webkitAudioContext)();
  #oscillator = this.#audioContext.createOscillator();
  #gainNode = this.#audioContext.createGain();
  #analyserNode = this.#audioContext.createAnalyser();
  #destination = this.#audioContext.destination;

  constructor(waveType, frequency, gain) {
    this.#init(waveType, frequency, gain);
  }

  set frequency(frequency) {
    this.#oscillator.frequency.value = frequency;
  }

  set gain(gain) {
    this.#gainNode.gain.value = gain;
  }

  get analyser() {
    return this.#analyserNode;
  }

  #init(waveType, frequency, gain) {
    this.#oscillator.type = waveType;
    this.#oscillator.frequency.value = frequency;
    this.#gainNode.gain.value = gain;
    this.#analyserNode.fftSize = 2048;
    this.#oscillator.connect(this.#gainNode);
    this.#gainNode.connect(this.#destination);
    this.#gainNode.connect(this.#analyserNode);
  }

  start() {
    this.#oscillator.start();
  }

  stop() {
    this.#audioContext.close();
  }
}

const playButton = document.querySelector('.play-button');
const stopButton = document.querySelector('.stop-button');
const currentFrequency = document.querySelector('.current-frequency');
const frequencyRange = document.querySelector('.frequency-range');
const currentGain = document.querySelector('.current-gain');
const gainRange = document.querySelector('.gain-range');
const waveFormValue = document.querySelector('.wave-form-output');
const waveFormButtons = document.querySelectorAll('.wave-form-buttons');
const maxFrequencyRange = document.querySelector('.max-frequency-range');
const canvas = document.getElementById("oscilloscope");
const canvasContext = canvas.getContext("2d");
canvas.width = '500'
canvas.height = '230'
canvasContext.fillStyle = "#001300";
canvasContext.lineWidth = 1.5;
canvasContext.strokeStyle = "#00ff04";
let soundWave = null;
let waveForm = 'sine';
waveFormValue.textContent = `Waveform: ${waveForm}`

function oscilloscope() {
  const bufferLength = soundWave.analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    if (!soundWave) {
      window.cancelAnimationFrame(draw);
      return;
    }
    requestAnimationFrame(draw);
  
    soundWave.analyser.getByteTimeDomainData(dataArray);
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    canvasContext.beginPath();

    const sliceWidth = (canvas.width * 1.0) / bufferLength;
    let x = 0;
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0;
      const y = (v * canvas.height) / 2;
      if (i === 0) {
        canvasContext.moveTo(x, y);
      } else {
        canvasContext.lineTo(x, y);
      }
      x += sliceWidth;
    }
    canvasContext.lineTo(canvas.width, canvas.height / 2);
    canvasContext.stroke();
  }

  draw();
}

function drawLine() {
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);
  canvasContext.beginPath();
  canvasContext.moveTo(0, canvas.height / 2);
  canvasContext.lineTo(canvas.width, canvas.height / 2);
  canvasContext.stroke();
}

playButton.addEventListener('click', () => {
  soundWave = new WaveGenerator(
    waveForm, frequencyRange.value, gainRange.value);
  soundWave.start();
  playButton.style.display = 'none';
  stopButton.style.display = 'block';
  oscilloscope();
});

stopButton.addEventListener("click", () => {
  soundWave.stop();
  soundWave = null;
  drawLine();
  stopButton.style.display = 'none';
  playButton.style.display = 'block';
});

frequencyRange.addEventListener('input', () => {
  currentFrequency.textContent = `Frequency: ${frequencyRange.value}hz`;
  if(soundWave) {
    soundWave.frequency = frequencyRange.value;
  }
});

gainRange.addEventListener('input', () => {
  currentGain.textContent = `Gain: ${gainRange.value}`;
  if(soundWave) {
    soundWave.gain = gainRange.value;
  }
});

for (let button of waveFormButtons) {
  button.addEventListener('click', (event) => {
    waveForm = event.target.value;
    waveFormValue.textContent = `Waveform: ${waveForm}`
    if(soundWave) {
      soundWave.stop();
      soundWave = null;
      soundWave = new WaveGenerator(
        waveForm, frequencyRange.value, gainRange.value);
      soundWave.start();
    }
  });
}

maxFrequencyRange.addEventListener('input', () => {
  if ((Number( maxFrequencyRange.value) >= 0) && 
    (Number( maxFrequencyRange.value <= 24000))) {
    frequencyRange.max = maxFrequencyRange.value;
    frequencyRange.value = maxFrequencyRange.value;
    currentFrequency.textContent = `Frequency: ${frequencyRange.value}hz`;
    if(soundWave) {
      soundWave.stop();
      soundWave = null;
      soundWave = new WaveGenerator(
        waveForm, frequencyRange.value, gainRange.value);
      soundWave.start();
    }
  }
});

drawLine();
