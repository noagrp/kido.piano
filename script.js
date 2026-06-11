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

// Lessons
const lessons = [
    { id: 1, title: "1. Holding & Tuning", content: "Sit comfortably. Use a tuner app. Memorize open strings E A D G B E." },
    { id: 2, title: "2. First Chord - Em", content: "Press 2nd fret on 5th and 4th strings." },
    { id: 3, title: "3. C Major", content: "3rd fret 5th, 2nd fret 4th, 1st fret 2nd string." },
    { id: 4, title: "4. G Major", content: "3rd fret 6th & 1st, 2nd fret 5th string." },
    { id: 5, title: "5. A minor (Am)", content: "2nd fret on strings 4, 3 and 2." },
    { id: 6, title: "6. D Major", content: "2nd fret on 3rd & 1st, 3rd fret on 2nd string." },
    { id: 7, title: "7. Basic Strumming", content: "Down-up strumming pattern with Em and G." },
    { id: 8, title: "8. Horse with No Name", content: "Em - D - Em - D (repeat)" }
];

function createLessons() {
    const container = document.getElementById('lessons-list');
    lessons.forEach(lesson => {
        const div = document.createElement('div');
        div.className = 'lesson';
        div.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${lesson.content}</p>
            <button onclick="playLessonExample(${lesson.id})">Play Example</button>
        `;
        container.appendChild(div);
    });
}

window.playLessonExample = function(id) {
    if (id === 2) playChord('Em');
    else if (id === 3) playChord('C');
    else if (id === 4) playChord('G');
    else if (id === 5) playChord('Am');
    else if (id === 6) playChord('D');
    else strumAll();
};

// Songs
const songs = [
    { title: "Twinkle Twinkle", chords: "C C G G A A G" },
    { title: "Happy Birthday", chords: "C C D C F E" },
    { title: "Amazing Grace", chords: "G G C G" }
];

function createSongs() {
    const container = document.getElementById('songs-list');
    songs.forEach(song => {
        const div = document.createElement('div');
        div.className = 'song-item';
        div.innerHTML = `
            <strong>${song.title}</strong>
            <p>${song.chords}</p>
            <button onclick="playSong('${song.chords}')">Play</button>
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
            delay += 900;
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
            const isHidden = panel.style.display !== 'block';
            panel.style.display = isHidden ? 'block' : 'none';
            plus.textContent = isHidden ? '–' : '+';
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    createGuitar();
    createChordButtons();
    createLessons();
    createSongs();
    setupToggles();
    document.getElementById('strum-btn').addEventListener('click', strumAll);
});
