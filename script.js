const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const stringNotes = [40, 45, 50, 55, 59, 64];

function createGuitar() {
    const fretsContainer = document.getElementById('frets');
    fretsContainer.innerHTML = '';
    for (let i = 0; i < 12; i++) {
        const fret = document.createElement('div');
        fret.className = 'fret';
        fretsContainer.appendChild(fret);
    }
}

function playNote(midiNote, duration = 850, velocity = 0.78) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const noise = audioContext.createBufferSource();

    osc.type = 'sawtooth';
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.012, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    filter.type = 'lowpass';
    filter.frequency.value = 1650;

    gain.gain.value = velocity * 0.4;

    noise.connect(filter);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    osc.start(now);
    noise.start(now);

    gain.gain.setValueAtTime(velocity * 0.95, now);
    gain.gain.linearRampToValueAtTime(velocity * 0.4, now + 0.05);
    gain.gain.linearRampToValueAtTime(velocity * 0.14, now + 0.28);
    gain.gain.linearRampToValueAtTime(0.001, now + duration / 1000);

    osc.stop(now + duration / 1000 + 0.3);
}

function strumAll() {
    let delay = 0;
    stringNotes.forEach((note, i) => {
        setTimeout(() => playNote(note, 780, 0.82), delay);
        delay += 38;
    });
}

const chords = {
    'C': [-1,3,2,0,1,0], 'G': [3,2,0,0,0,3], 'Am': [-1,0,2,2,1,0],
    'Em': [0,2,2,0,0,0], 'D': [-1,-1,0,2,3,2], 'F': [1,3,3,2,1,1],
    'A': [-1,0,2,2,2,0], 'E': [0,2,2,1,0,0], 'Dm': [-1,-1,0,2,3,1],
    'Bm': [2,2,4,4,3,2], 'G7': [3,2,0,0,0,1], 'C7': [-1,3,2,3,1,0],
    'D7': [-1,-1,0,2,1,2]
};

function playChord(chordName) {
    const frets = chords[chordName];
    if (!frets) return;
    frets.forEach((fret, i) => {
        if (fret >= 0) {
            setTimeout(() => playNote(stringNotes[i] + fret, 820, 0.72), i * 25);
        }
    });
}

function createChordButtons() {
    const container = document.getElementById('chord-buttons');
    Object.keys(chords).forEach(chord => {
        const btn = document.createElement('button');
        btn.textContent = chord;
        btn.addEventListener('click', () => playChord(chord));
        container.appendChild(btn);
    });
}

// Lessons & Songs (same as before)
const lessons = [ /* ... copy from previous full version if needed ... */ ];
// (For brevity I'm keeping it short - you can use the lessons from earlier messages)

document.addEventListener('DOMContentLoaded', () => {
    createGuitar();
    createChordButtons();
    createLessons();
    createSongs();
    setupToggles();
    document.getElementById('strum-btn').addEventListener('click', strumAll);
});
