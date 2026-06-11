// Kido Guitar Lab - Full Script with More Chords
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

const openStrings = ['E2', 'A2', 'D3', 'G3', 'B3', 'E4'];
const stringNotes = [40, 45, 50, 55, 59, 64];

// Create guitar
function createGuitar() {
    const stringsContainer = document.getElementById('strings');
    const fretsContainer = document.getElementById('frets');
    stringsContainer.innerHTML = '';
    fretsContainer.innerHTML = '';

    for (let i = 0; i < 12; i++) {
        const fret = document.createElement('div');
        fret.className = 'fret';
        fretsContainer.appendChild(fret);
    }

    openStrings.forEach((note, index) => {
        const string = document.createElement('div');
        string.className = 'string';
        string.dataset.note = note;
        string.dataset.stringIndex = index;
        
        string.addEventListener('mousedown', (e) => playNoteFromTap(e, index));
        string.addEventListener('touchstart', (e) => {
            e.preventDefault();
            playNoteFromTap(e, index);
        });
        
        stringsContainer.appendChild(string);
    });
}

function playNote(midiNote, duration = 1100, velocity = 0.75) {
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const filter = audioContext.createBiquadFilter();
    const noise = audioContext.createBufferSource();

    osc.type = 'sawtooth';
    osc.frequency.value = 440 * Math.pow(2, (midiNote - 69) / 12);

    const buffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.015, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    noise.buffer = buffer;

    filter.type = 'lowpass';
    filter.frequency.value = 1900;

    gain.gain.value = velocity * 0.38;

    noise.connect(filter);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(audioContext.destination);

    const now = audioContext.currentTime;
    osc.start(now);
    noise.start(now);

    gain.gain.setValueAtTime(velocity * 0.95, now);
    gain.gain.linearRampToValueAtTime(velocity * 0.35, now + 0.07);
    gain.gain.linearRampToValueAtTime(velocity * 0.18, now + 0.35);
    gain.gain.linearRampToValueAtTime(0.001, now + duration / 1000);

    osc.stop(now + duration / 1000 + 0.4);
}

function playNoteFromTap(e, stringIndex) {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    const height = rect.height;
    let fret = Math.floor((y / height) * 13);
    if (fret < 0) fret = 0;
    if (fret > 12) fret = 12;

    const baseMidi = stringNotes[stringIndex];
    playNote(baseMidi + fret);
}

function strumAll() {
    let delay = 0;
    stringNotes.forEach((note, i) => {
        setTimeout(() => playNote(note, 950, 0.8), delay);
        delay += 40;
    });
}

// Expanded chords with correct fingerings
const chords = {
    'C':  [-1, 3, 2, 0, 1, 0],
    'G':  [3, 2, 0, 0, 0, 3],
    'Am': [-1, 0, 2, 2, 1, 0],
    'Em': [0, 2, 2, 0, 0, 0],
    'D':  [-1, -1, 0, 2, 3, 2],
    'F':  [1, 3, 3, 2, 1, 1],
    'A':  [-1, 0, 2, 2, 2, 0],
    'E':  [0, 2, 2, 1, 0, 0],
    'Dm': [-1, -1, 0, 2, 3, 1],
    'Bm': [2, 2, 4, 4, 3, 2],   // Barre chord
    'G7': [3, 2, 0, 0, 0, 1],
    'C7': [-1, 3, 2, 3, 1, 0],
    'D7': [-1, -1, 0, 2, 1, 2]
};

function playChord(chordName) {
    const frets = chords[chordName];
    if (!frets) return;
    frets.forEach((fret, i) => {
        if (fret >= 0) {
            setTimeout(() => playNote(stringNotes[i] + fret, 1000, 0.7), i * 30);
        }
    });
}

function createChordButtons() {
    const container = document.getElementById('chord-buttons');
    container.innerHTML = ''; // Clear first
    Object.keys(chords).forEach(chord => {
        const btn = document.createElement('button');
        btn.textContent = chord;
        btn.addEventListener('click', () => playChord(chord));
        container.appendChild(btn);
    });
}

// Lessons, Songs, Toggles (same as before)
const lessons = [
    { id: 1, title: "1. Holding & Tuning", content: "Sit comfortably. Tune using a tuner app. Open strings: E A D G B E." },
    { id: 2, title: "2. Open Strings", content: "Tap each string on the guitar. Learn their sounds." },
    { id: 3, title: "3. E minor (Em)", content: "Fingers 2 & 3 on 2nd fret (5th & 4th strings)." },
    { id: 4, title: "4. C Major", content: "3rd fret 5th, 2nd fret 4th, 1st fret 2nd string." },
    { id: 5, title: "5. G Major", content: "3rd fret on 6th & 1st, 2nd fret on 5th." },
    { id: 6, title: "6. A minor (Am)", content: "2nd fret on 4th, 3rd & 2nd strings." },
    { id: 7, title: "7. D Major", content: "2nd fret 3rd & 1st, 3rd fret 2nd string." },
    { id: 8, title: "8. Basic Strumming", content: "Down-up pattern. Practice with Em → G." },
    { id: 9, title: "9. Horse with No Name", content: "Em - D - Em - D (repeat)" },
    { id: 10, title: "10. Next Steps", content: "Keep practicing chord changes daily!" }
];

function createLessons() {
    const container = document.getElementById('lessons-list');
    container.innerHTML = '';
    lessons.forEach(lesson => {
        const div = document.createElement('div');
        div.className = 'lesson';
        div.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.content}</p>
            <button onclick="playLessonExample(${lesson.id})">Play Example</button>
            <button onclick="markDone(this)">Mark Done</button>
        `;
        container.appendChild(div);
    });
}

window.playLessonExample = function(id) {
    if (id === 3) playChord('Em');
    else if (id === 4) playChord('C');
    else if (id === 5) playChord('G');
    else if (id === 6) playChord('Am');
    else if (id === 7) playChord('D');
    else if (id === 9) { playChord('Em'); setTimeout(() => playChord('D'), 600); }
    else strumAll();
};

window.markDone = function(btn) {
    btn.textContent = '✅ Done';
    btn.disabled = true;
};

const songs = [
    { title: "Twinkle Twinkle Little Star", chords: "C C G G A A G" },
    { title: "Happy Birthday", chords: "C C D C F E" },
    { title: "Amazing Grace", chords: "G G C G" },
    { title: "Jingle Bells", chords: "C C C C C C" }
];

function createSongs() {
    const container = document.getElementById('songs-list');
    container.innerHTML = '';
    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerHTML = `
            <strong>${song.title}</strong>
            <p>${song.chords}</p>
            <button onclick="playSong('${song.chords}')">Play Progression</button>
        `;
        container.appendChild(div);
    });
}

window.playSong = function(chordStr) {
    const chordList = chordStr.split(' ');
    let delay = 0;
    chordList.forEach(ch => {
        if (chords[ch]) {
            setTimeout(() => playChord(ch), delay);
            delay += 850;
        }
    });
};

function setupToggles() {
    const toggleBtn = document.getElementById('controls-toggle');
    const features = document.getElementById('features-container');

    toggleBtn.addEventListener('click', () => {
        if (features.style.display === 'block') {
            features.style.display = 'none';
            toggleBtn.textContent = 'Show Controls +';
        } else {
            features.style.display = 'block';
            toggleBtn.textContent = 'Hide Controls –';
        }
    });

    document.querySelectorAll('.toggle-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const panel = document.getElementById(targetId);
            const plus = header.querySelector('.plus');
            const isHidden = panel.style.display === 'none' || !panel.style.display;
            
            panel.style.display = isHidden ? 'block' : 'none';
            plus.textContent = isHidden ? '–' : '+';
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    createGuitar();
    createChordButtons();
    createLessons();
    createSongs();
    setupToggles();

    document.getElementById('strum-btn').addEventListener('click', strumAll);

    document.getElementById('neck').addEventListener('click', (e) => {
        if (e.target.classList.contains('string')) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const y = e.clientY - rect.top;
        const stringHeight = rect.height / 6;
        const stringIndex = Math.floor(y / stringHeight);
        if (stringIndex >= 0 && stringIndex < 6) {
            const strings = document.querySelectorAll('.string');
            playNoteFromTap({clientY: e.clientY, currentTarget: strings[stringIndex]}, stringIndex);
        }
    });
});
