const CONSTRUCT = require('construct-js');
const FS = require('fs');
const PATH = require('path');

//const outputDir = '../../../assets/audio/';
const outputDir = '../public/audio/'

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

const sampleRate = 44100;

const riffChunkStruct = CONSTRUCT.Struct('riffChunk')
    .field('magic', CONSTRUCT.RawString('RIFF'))
    .field('size', CONSTRUCT.U32LE(0))
    .field('fmtName', CONSTRUCT.RawString('WAVE'));

const formatChunkStruct = CONSTRUCT.Struct('fmtSubChunk')
    .field('id', CONSTRUCT.RawString('fmt '))
    .field('subChunk1Size', CONSTRUCT.U32LE(0))
    .field('audioFormat', CONSTRUCT.U16LE(1))
    .field('numChannels', CONSTRUCT.U16LE(1))
    .field('sampleRate', CONSTRUCT.U32LE(44100))
    .field('byteRate', CONSTRUCT.U32LE(88200))
    .field('blockAlign', CONSTRUCT.U16LE(2))
    .field('bitsPerSample', CONSTRUCT.U16LE(16));
const totalSubChunkSize = formatChunkStruct.computeBufferSize();
formatChunkStruct.get('subChunk1Size').set(totalSubChunkSize - 8);

const dataSubChunkStruct = CONSTRUCT.Struct('dataSubChunk')
    .field('id', CONSTRUCT.RawString('data'))
    .field('size', CONSTRUCT.U32LE(0))
    .field('data', CONSTRUCT.S16LEs([0]));

const soundData = [];

const A4Freq = 440;
const A4 = Math.floor(sampleRate / A4Freq);

function generateSound(soundData, waveFrequency, durationInSecs, volume = 5000) {
    if (durationInSecs < 1) {
        let allowedValues = [0.5, 0.45, 0.3, 0.2, 0.1, 0.125, 0.15, 0.25, 0.05, 0.04, 0.02, 0.01];

        if (!allowedValues.find(val => val === durationInSecs)) {
            console.log(`Duration in secs smaller than 1 should be one between [${allowedValues.join(', ')}]. Found ${durationInSecs}`);
        }
    }
    let isUp = true;
    let freq = Math.floor(waveFrequency);
    let durationInSamples = sampleRate * durationInSecs;
    for (let i = 0; i < durationInSamples; ++i) {
        if (i % freq === 0) {
            isUp = !isUp;
        }
        let sampleValue = isUp ? volume : -volume;

        soundData.push(sampleValue);
    }
}

function oneOctaveHigher(frequency) {
    return frequency / 2;
}
function oneOctaveLower(frequency) {
    return frequency * 2;
}
function oneSemitoneHigher(frequency) {
    return frequency / 1.059463;
}
function oneSemitoneLower(frequency) {
    return frequency * 1.059463;
}

function getValueFromNote(note) {
    note = note.toUpperCase();
    switch (note) {
        case 'A': return 10;
        case 'B': return 12;
        case 'C': return 1;
        case 'D': return 3;
        case 'E': return 5;
        case 'F': return 6;
        case 'G': return 8;
    }
    console.log(`Invalid note to get value from! Note: ${note}`);
    return null;
}

function distanceFromA4(note) {
    if (typeof note !== 'string') {
        console.log('Cant calculate note from something not a string!');
        return;
    }
    if (note.length < 2 || note.length > 3) {
        console.log('Expected note to have 2 characters. Ex: "C2", "D#4"');
    }
    valueA4 = 4 * 12 + getValueFromNote('A');

    let noteNumber = 0;
    const scale = note.length === 2 ? parseInt(note[1]) : parseInt(note[2]);
    noteNumber += scale * 12;
    noteNumber += getValueFromNote(note[0]);

    if (note[1] === '#') noteNumber += 1;
    if (note[1] === 'b') noteNumber -= 1;

    return noteNumber - valueA4;
}

function moveNSemitones(n, freq) {
    if (n === 0) {
        return freq;
    }
    let pitchChanger = n > 0 ? oneSemitoneHigher : oneSemitoneLower;
    let size = n < 0 ? -n : n;
    for (let i = 0; i < size; ++i) {
        freq = pitchChanger(freq);
    }
    return freq;
}
function generatePause(soundData, durationInSecs) {
    generateSound(soundData, 1, durationInSecs, 0);
}

function getNote(note) {
    return moveNSemitones(distanceFromA4(note), A4);
}

/*
function generateSoundByArray(soundData, soundArray) {
    soundArray.forEach(sound => {
        if (sound.pause) {
            generatePause(soundData, sound.duration);
        } else {
            generateSound(soundData, getNote(sound.note), sound.duration);
        }
    });
}
let soundArray = [
    { note: 'C4', duration: 0.5 },
    { note: 'C#4', duration: 0.5 },
    { note: 'G4', duration: 0.5 },
    { note: 'E4', duration: 0.5 },
    { note: 'C4', duration: 0.5 },
    { pause: true, duration: 0.5 },
    { note: 'C4', duration: 1 },
    { note: 'C#4', duration: 1 },
    { pause: true, duration: 0.5 },
    { note: 'C#4', duration: 0.5 },
    { note: 'F4', duration: 0.5 },
    { note: 'G#4', duration: 0.5 },
    { note: 'F4', duration: 0.5 },
    { note: 'C#4', duration: 0.5 },
    { pause: true, duration: 0.5 },
    { note: 'C#4', duration: 1 },
    { note: 'D4', duration: 1 },
]
generateSoundByArray(soundData, soundArray);
*/

function getNextNote(note) {
    // TODO: Fazer bemois e fazer uma função decente...
    if (note[0] === 'A' && note[1] === '#') return `B${note[2]}`;
    if (note[0] === 'A' && note[1] !== '#') return `A#${note[1]}`;
    if (note[0] === 'G' && note[1] === '#') return `A${note[2]}`;
    if (note[0] === 'G' && note[1] !== '#') return `G#${note[1]}`;
    if (note[0] === 'F' && note[1] === '#') return `G${note[2]}`;
    if (note[0] === 'F' && note[1] !== '#') return `F#${note[1]}`;
    if (note[0] === 'E' && note[1] !== '#') return `F${note[1]}`;
    if (note[0] === 'D' && note[1] === '#') return `E${note[2]}`;
    if (note[0] === 'D' && note[1] !== '#') return `D#${note[1]}`;
    if (note[0] === 'C' && note[1] === '#') return `D${note[2]}`;
    if (note[0] === 'C' && note[1] !== '#') return `C#${note[1]}`;
    // Increase octave
    if (note[0] === 'B' && note[1] !== 'b') return `C${parseInt(note[1])+1}`;
}

function getPreviousNote(note) {
    // TODO: Fazer bemois e fazer uma função decente...
    if (note[0] === 'B' && note[1] !== 'b') return `A#${note[1]}`;
    if (note[0] === 'A' && note[1] === '#') return `A${note[2]}`;
    if (note[0] === 'A' && note[1] !== '#') return `G#${note[1]}`;
    if (note[0] === 'G' && note[1] === '#') return `G${note[2]}`;
    if (note[0] === 'G' && note[1] !== '#') return `F#${note[1]}`;
    if (note[0] === 'F' && note[1] === '#') return `F${note[2]}`;
    if (note[0] === 'F' && note[1] !== '#') return `E${note[1]}`;
    if (note[0] === 'E' && note[1] !== '#') return `D#${note[1]}`;
    if (note[0] === 'D' && note[1] === '#') return `D${note[2]}`;
    if (note[0] === 'D' && note[1] !== '#') return `C#${note[1]}`;
    if (note[0] === 'C' && note[1] === '#') return `C${note[2]}`;
    // Decrease octave
    if (note[0] === 'C' && note[1] !== '#') return `B${parseInt(note[1])-1}`;
}

function generateWarmup(warmupCoreGenerator, firstNote, repetitions) {
    let initialNote = firstNote;
    for (let i = 0; i < repetitions; ++i) {
        warmupCoreGenerator(initialNote, i != repetitions - 1);
        initialNote = getNextNote(initialNote);
    }
}

//Bocca chiusa
function warmup1Generator(firstNote, shouldModulate) {
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(firstNote));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(note2Name));
    let note3 = getNote(note3Name);
    generateSound(soundData, note1, 0.5);
    generateSound(soundData, note2, 0.5);
    generateSound(soundData, note1, 0.5);
    generateSound(soundData, note2, 0.5);
    generateSound(soundData, note3, 0.5);
    generateSound(soundData, note2, 0.5);
    generateSound(soundData, note3, 0.5);
    generateSound(soundData, note2, 0.5);
    generateSound(soundData, note1, 0.5);

    if (shouldModulate) {
        generatePause(soundData, 0.5);
        generateSound(soundData, note1, 1);
        generateSound(soundData, getNote(getNextNote(firstNote)), 1);
        generatePause(soundData, 1);
    }
}

// Vroli vroli vroli vroli brin bréin brin bréin brin
function warmup2Generator(firstNote, shouldModulate) {
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(firstNote));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(note2Name));
    let note3 = getNote(note3Name);
    let note4Name = getNextNote(note3Name);
    let note4 = getNote(note4Name);
    let note5Name = getNextNote(getNextNote(note4Name));
    let note5 = getNote(note5Name);
    // vroli
    generateSound(soundData, note1, 0.25);
    generateSound(soundData, note2, 0.25);
    generateSound(soundData, note3, 0.25);
    generateSound(soundData, note4, 0.25);
    generateSound(soundData, note5, 0.25);
    generateSound(soundData, note4, 0.25);
    generateSound(soundData, note3, 0.25);
    generateSound(soundData, note2, 0.25);

    // brin bréin
    generateSound(soundData, note1, 0.5);
    generateSound(soundData, note3, 0.5);
    generateSound(soundData, note5, 0.5);
    generateSound(soundData, note3, 0.5);
    generateSound(soundData, note1, 0.25);

    if (shouldModulate) {
        generatePause(soundData, 0.25);
        generateSound(soundData, note1, 0.5);
        generateSound(soundData, getNote(getNextNote(firstNote)), 0.5);
        generatePause(soundData, 0.5);
    }
}

// o - i - a
function warmup3Generator(firstNote, shouldModulate) {
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(firstNote));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(note2Name));
    let note3 = getNote(note3Name);
    let note4Name = getNextNote(note3Name);
    let note4 = getNote(note4Name);
    let note5Name = getNextNote(getNextNote(note4Name));
    let note5 = getNote(note5Name);

    let duration = 0.15;
    for (let i = 0; i < 3; ++i) {
        generateSound(soundData, note1, duration);
        generatePause(soundData, duration);
        generateSound(soundData, note1, duration);
        generateSound(soundData, note2, duration);
        generateSound(soundData, note3, duration);
        generatePause(soundData, duration);
        generateSound(soundData, note3, duration);
        generateSound(soundData, note4, duration);
        generateSound(soundData, note5, duration);
        generatePause(soundData, duration);
        generateSound(soundData, note5, duration);
        generateSound(soundData, note4, duration);
        generateSound(soundData, note3, duration);
        generateSound(soundData, note4, duration);
        generateSound(soundData, note3, duration);
        generateSound(soundData, note2, duration);
    }
    generateSound(soundData, note1, duration);

    if (shouldModulate) {
        generatePause(soundData, duration);
        generateSound(soundData, note1, 2 * duration);
        generateSound(soundData, getNote(getNextNote(firstNote)), 0.45);
        generatePause(soundData, duration);
    }
}

// ziu ziu ziu ziu zi
function warmup4Generator(firstNote, shouldModulate) {
}

//generateWarmup(warmup1Generator, 'C4', 2); // bocca chiusa
//generateWarmup(warmup2Generator, 'C4', 2); // vroli vroli
//generateWarmup(warmup3Generator, 'C4', 2); // o - i - a

/* Music 3 */
/*
generateSound(soundData, getNote('C4'), 0.5);
generateSound(soundData, getNote('E4'), 0.5);
generateSound(soundData, getNote('G4'), 0.5);
generateSound(soundData, getNote('E4'), 0.5);
generateSound(soundData, getNote('C4'), 0.5);
generatePause(soundData, 0.5);
generateSound(soundData, getNote('C4'), 1);
generateSound(soundData, getNote('C#4'), 1);
generatePause(soundData, 0.5);
generateSound(soundData, getNote('C#4'), 0.5);
generateSound(soundData, getNote('F4'), 0.5);
generateSound(soundData, getNote('G#4'), 0.5);
generateSound(soundData, getNote('F4'), 0.5);
generateSound(soundData, getNote('C#4'), 0.5);
*/

/* Music 2
generateSound(soundData, A4, 1);
generatePause(soundData, 1);
generateSound(soundData, A4, 1);
generateSound(soundData, moveNSemitones(7, A4), 1);
generateSound(soundData, A4, 1);
*/

/* Music 1
generateSound(soundData, oneSemitoneHigher(A4), 1);
generatePause(soundData, 1);
generateSound(soundData, oneSemitoneHigher(oneSemitoneHigher(oneSemitoneHigher(A4))), 1);
*/
//generateSound(soundData, A4, 1);
//generateSound(soundData, A2, 1);

/* NEEDED TO GENERATE ANYTHING
dataSubChunkStruct.get('data').set(soundData);
dataSubChunkStruct.get('size').set(soundData.length * 2);

const totalSize = dataSubChunkStruct.computeBufferSize() + riffChunkStruct.computeBufferSize() + formatChunkStruct.computeBufferSize();

const fileStruct = CONSTRUCT.Struct('waveFile')
    .field('riffChunk', riffChunkStruct)
    .field('formatChunkStruct', formatChunkStruct)
    .field('dataSubChunkStruct', dataSubChunkStruct);

FS.writeFileSync(PATH.join(__dirname, './new.wav'), fileStruct.toBuffer());
*/

let generators = [warmup1Generator, warmup2Generator, warmup3Generator, warmup4Generator];

function generateFullWarmup(params) {
    /* Params example:
    [
        { exerciseId: 0, range: { begin: 10, end: 20 },
        { exerciseId: 2, range: { begin: 5, end: 20 }
    ]
    */
    if (!params) {
        console.log('No params! Aborting...');
        return;
    }
    soundData.splice(0, soundData.length);

    let exercises = params.exercises;
    let basename = params.name;

    for (let i = 0; i < exercises.length; ++i) {
        let exercise = exercises[i];
        if ((!exercise.exerciseId && exercise.exerciseId !== 0) || !exercise.range
            || !exercise.range.begin || !exercise.range.end) {
            console.log(`Invalid exercise! Aborting at exercise ${i}... exercise were:`, exercise);
            console.log('Expected format: { exerciseId: 0, range: { begin: 10, end: 20 }');
            return;
        }

        exercise.range.begin = parseInt(exercise.range.begin);
        exercise.range.end = parseInt(exercise.range.end);

        if (exercise.range.begin < 1 || !exercise.range.begin > !exercise.range.end) {
            console.log(`Invalid range! Aborting at exercise ${i}... exercise were:`, exercise);
            console.log('Expected format: { exerciseId: 0, range: { begin: 10, end: 20 }');
            return;
        }

        let range = exercise.range.end - exercise.range.begin;
        let initialNote = 'C3';
        for (let j = 0; j < exercise.range.begin; ++j) {
            initialNote = getNextNote(initialNote);
        }
        if (!generators[exercise.exerciseId]) {
            console.log(`Invalid generator! No predefined exercise with ID ${exercise.exerciseId}! Aborting...`);
            return;
        }
        generateWarmup(generators[exercise.exerciseId], initialNote, range);
        // TODO: Sound data is global, I do not need to send as parameter...
        generatePause(soundData, 2);
    }

    dataSubChunkStruct.get('data').set(soundData);
    dataSubChunkStruct.get('size').set(soundData.length * 2);

    const fileStruct = CONSTRUCT.Struct('waveFile')
        .field('riffChunk', riffChunkStruct)
        .field('formatChunkStruct', formatChunkStruct)
        .field('dataSubChunkStruct', dataSubChunkStruct);

    let filename = basename;
    let count = 0;
    while (FS.existsSync(PATH.join(__dirname, `${outputDir}${filename}.wav`))) {
        ++count;
        filename = `${basename} (${count})`;
    }

    FS.writeFileSync(PATH.join(__dirname, `${outputDir}${filename}.wav`), fileStruct.toBuffer());

    return `${filename}.wav`;
};

module.exports = generateFullWarmup;
