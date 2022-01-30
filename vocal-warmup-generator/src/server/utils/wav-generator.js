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

function generateWarmup(warmupCoreGenerator, firstNote, repetitions, ascending, speed) {
    if (ascending) {
        let initialNote = firstNote;
        for (let i = 0; i < repetitions; ++i) {
            warmupCoreGenerator(initialNote, i != repetitions - 1, speed);
            initialNote = getNextNote(initialNote);
        }
    } else {
        let initialNote = firstNote;
        // Descending exercises start at the highest note and go to the lowest
        for (let i = 0; i < repetitions; ++i) {
            initialNote = getNextNote(initialNote);
        }
        
        for (let i = 0; i < repetitions; ++i) {
            warmupCoreGenerator(initialNote, i != repetitions - 1, speed);
            initialNote = getPreviousNote(initialNote);
        }
    }
}

//Bocca chiusa
function warmup1Generator(firstNote, shouldModulate, speed) {
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(firstNote));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(note2Name));
    let note3 = getNote(note3Name);

    let duration = 0.5;
    if (speed === 'slow') {
        duration = 0.4;
    } else if (speed === 'fast') {
        duration = 0.6;
    }

    generateSound(soundData, note1, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note1, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note3, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note3, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note1, duration);

    if (shouldModulate) {
        generatePause(soundData, duration);
        generateSound(soundData, note1, duration * 2);
        generateSound(soundData, getNote(getNextNote(firstNote)), duration * 2);
        generatePause(soundData, duration * 2);
    }
}

// Vroli vroli vroli vroli brin bréin brin bréin brin
function warmup2Generator(firstNote, shouldModulate, speed) {
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(firstNote));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(note2Name));
    let note3 = getNote(note3Name);
    let note4Name = getNextNote(note3Name);
    let note4 = getNote(note4Name);
    let note5Name = getNextNote(getNextNote(note4Name));
    let note5 = getNote(note5Name);

    let duration = 0.25;
    if (speed === 'slow') {
        duration = 0.2;
    } else if (speed === 'fast') {
        duration = 0.3;
    }

    // vroli
    generateSound(soundData, note1, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note3, duration);
    generateSound(soundData, note4, duration);
    generateSound(soundData, note5, duration);
    generateSound(soundData, note4, duration);
    generateSound(soundData, note3, duration);
    generateSound(soundData, note2, duration);

    // brin bréin
    generateSound(soundData, note1, duration * 2);
    generateSound(soundData, note3, duration * 2);
    generateSound(soundData, note5, duration * 2);
    generateSound(soundData, note3, duration * 2);
    generateSound(soundData, note1, duration);

    if (shouldModulate) {
        generatePause(soundData, duration);
        generateSound(soundData, note1, duration * 2);
        generateSound(soundData, getNote(getNextNote(firstNote)), duration * 2);
        generatePause(soundData, duration * 2);
    }
}

// o - i - a
function warmup3Generator(firstNote, shouldModulate, speed) {
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
    if (speed === 'slow') {
        duration = 0.12;
    } else if (speed === 'fast') {
        duration = 0.18;
    }

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
        generateSound(soundData, getNote(getNextNote(firstNote)), 3 * duration);
        generatePause(soundData, duration);
    }
}

// mei mai mei
function warmup4Generator(firstNote, shouldModulate, speed) {
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(getNextNote(getNextNote(firstNote))));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(getNextNote(note2Name)));
    let note3 = getNote(note3Name);

    let duration = 0.2;
    if (speed === 'slow') {
        duration = 0.15;
    } else if (speed === 'fast') {
        duration = 0.25;
    }

    for (let i = 0; i < 2; ++i) {
        generateSound(soundData, note1, duration);
        generatePause(soundData, duration / 3);
        generateSound(soundData, note2, duration);
        generatePause(soundData, duration / 3);
        generateSound(soundData, note3, duration);
        generatePause(soundData, duration / 3);
        generateSound(soundData, note2, duration);
        generatePause(soundData, duration / 3);
    }
    generateSound(soundData, note1, duration);
    generatePause(soundData, duration / 3);

    if (shouldModulate) {
        generateSound(soundData, note1, duration);
        generatePause(soundData, duration / 3);
        generateSound(soundData, getNote(getNextNote(firstNote)), duration * 2);
        generatePause(soundData, duration / 3 * 2);
    }
}

// ziu ziu ziu ziu zi
function warmup5Generator(firstNote, shouldModulate, speed) {
    let note0 = getNote(getPreviousNote(firstNote));
    let note1 = getNote(firstNote);
    let note2Name = getNextNote(getNextNote(firstNote));
    let note2 = getNote(note2Name);
    let note3Name = getNextNote(getNextNote(note2Name));
    let note3 = getNote(note3Name);
    let note4Name = getNextNote(note3Name);
    let note4 = getNote(note4Name);
    let note5Name = getNextNote(getNextNote(note4Name));
    let note5 = getNote(note5Name);

    let duration = 0.25;
    if (speed === 'slow') {
        duration = 0.2;
    } else if (speed === 'fast') {
        duration = 0.3;
    }
    
    generateSound(soundData, note5, duration);
    generateSound(soundData, note3, duration);
    generateSound(soundData, note4, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note3, duration);
    generateSound(soundData, note1, duration);
    generateSound(soundData, note2, duration);
    generateSound(soundData, note0, duration);
    generateSound(soundData, note1, duration);
    generatePause(soundData, duration);

    if (shouldModulate) {
        generateSound(soundData, note5, duration);
        generatePause(soundData, duration);
        generateSound(soundData, getNote(getPreviousNote(note5Name)), duration * 3);
        generatePause(soundData, duration);
    }
}

// vamos cantar
function warmup6Generator(firstNote, shouldModulate, speed) {
    let fundamental = getNote(firstNote);
    let secondName = getNextNote(getNextNote(firstNote));
    let second = getNote(secondName);
    let thirdName = getNextNote(getNextNote(secondName));
    let third = getNote(thirdName);
    let fourthName = getNextNote(thirdName);
    let fourth = getNote(fourthName);
    let fifthName = getNextNote(getNextNote(fourthName));
    let fifth = getNote(fifthName);
    let sixthName = getNextNote(getNextNote(fifthName));
    let sixth = getNote(sixthName);
    let seventhName = getNextNote(getNextNote(sixthName));
    let seventh = getNote(seventhName);
    let octaveName = getNextNote(seventhName);
    let octave = getNote(octaveName);
    let ninthName = getNextNote(getNextNote(octaveName));
    let ninth = getNote(ninthName);

    let duration = 0.4;
    if (speed === 'slow') {
        duration = 0.35;
    } else if (speed === 'fast') {
        duration = 0.45;
    }

    generateSound(soundData, fundamental, duration);
    generateSound(soundData, third, duration);
    generateSound(soundData, fifth, duration);
    generateSound(soundData, octave, duration * 2.5);
    generateSound(soundData, seventh, duration / 2);
    generateSound(soundData, octave, duration / 2);
    generateSound(soundData, ninth, duration / 2);
    generateSound(soundData, octave, duration / 2);
    generateSound(soundData, seventh, duration / 2);
    generateSound(soundData, octave, duration / 2);
    generateSound(soundData, ninth, duration / 2);
    generateSound(soundData, octave, duration / 2);
    generateSound(soundData, seventh, duration / 2);
    generateSound(soundData, octave, duration / 2);
    generateSound(soundData, ninth, duration / 2);
    generateSound(soundData, octave, duration / 2);
    generateSound(soundData, seventh, duration / 2);
    generateSound(soundData, sixth, duration / 2);
    generateSound(soundData, fifth, duration / 2);
    generateSound(soundData, fourth, duration / 2);
    generateSound(soundData, third, duration / 2);
    generateSound(soundData, second, duration / 2);
    generateSound(soundData, fundamental, duration * 3.5);
    generatePause(soundData, duration);

    if (shouldModulate) {
        generateSound(soundData, fundamental, duration);
        generatePause(soundData, duration);
        generateSound(soundData, getNote(getNextNote(firstNote)), duration * 3);
        generatePause(soundData, duration);
    }
}

// un jardin di rose
function warmup7Generator(firstNote, shouldModulate, speed) {
    let fundamental = getNote(firstNote);
    let secondName = getNextNote(getNextNote(firstNote));
    let second = getNote(secondName);
    let thirdName = getNextNote(getNextNote(secondName));
    let third = getNote(thirdName);
    let fourthName = getNextNote(thirdName);
    let fourth = getNote(fourthName);
    let fifthName = getNextNote(getNextNote(fourthName));
    let fifth = getNote(fifthName);
    let sixthName = getNextNote(getNextNote(fifthName));
    let seventhName = getNextNote(getNextNote(sixthName));
    let seventh = getNote(seventhName);
    let octaveName = getNextNote(seventhName);
    let octave = getNote(octaveName);

    let duration = 0.5;
    if (speed === 'slow') {
        duration = 0.4;
    } else if (speed === 'fast') {
        duration = 0.6;
    }

    generateSound(soundData, fundamental, duration);
    generateSound(soundData, third, duration);
    generateSound(soundData, fifth, duration);
    generateSound(soundData, octave, duration);
    generateSound(soundData, seventh, duration);
    generateSound(soundData, fifth, duration);
    generateSound(soundData, fourth, duration);
    generateSound(soundData, second, duration);
    generateSound(soundData, fundamental, duration * 0.8);
    generatePause(soundData, duration * 0.2);

    if (shouldModulate) {
        generateSound(soundData, fundamental, duration * 0.8);
        generatePause(soundData, duration * 0.2);
        generateSound(soundData, getNote(getPreviousNote(firstNote)), duration * 1.8);
        generatePause(soundData, duration * 0.2);
    }
}

// glissando
function warmup8Generator(firstNote, shouldModulate, speed) {
    let fundamental = getNote(firstNote);
    let octaveName = firstNote;
    for (let i = 0; i < 12; ++i) {
        octaveName = getNextNote(octaveName);
    }
    let octave = getNote(octaveName);

    let duration = 1;
    if (speed === 'slow') {
        duration = 1.2;
    } else if (speed === 'fast') {
        duration = 0.8;
    }

    generateSound(soundData, fundamental, duration);
    generateSound(soundData, octave, duration);
    generateSound(soundData, fundamental, duration);
    generatePause(soundData, duration / 4);

    if (shouldModulate) {
        generateSound(soundData, fundamental, duration / 4);
        generatePause(soundData, duration / 4);
        generateSound(soundData, getNote(getNextNote(firstNote)), duration);
        generatePause(soundData, duration / 4);
    }
}

// uu - uu (Ascending)
function warmup9Generator(firstNote, shouldModulate, speed) {
    let fundamental = getNote(firstNote);
    let minorSecondName = getNextNote(firstNote);
    let minorSecond = getNote(minorSecondName);
    let majorSecondName =  getNextNote(minorSecondName);
    let majorSecond = getNote(majorSecondName);
    let minorThirdName =  getNextNote(majorSecondName);
    let minorThird = getNote(minorThirdName);

    let duration = 0.4;
    if (speed === 'slow') {
        duration = 0.45;
    } else if (speed === 'fast') {
        duration = 0.35;
    }

    for (let i = 0; i < 2; ++i)
    {
        generatePause(soundData, duration / 2);
        generateSound(soundData, fundamental, duration / 2);
        generateSound(soundData, minorSecond, duration / 2);
        generatePause(soundData, duration / 2);
        generateSound(soundData, majorSecond, duration / 2);
        generateSound(soundData, minorThird, (i == 0) ? duration * 2 : duration);
        generatePause(soundData, (i == 0) ? duration : duration / 4);
    }

    if (shouldModulate) {
        generateSound(soundData, fundamental, duration);
        generatePause(soundData, duration / 3);
        generateSound(soundData, getNote(getNextNote(firstNote)), duration / 2);
    }
}

// uu - uu (Descending)
function warmup10Generator(firstNote, shouldModulate, speed) {
    let fundamental = getNote(firstNote);
    let minorSecondName = getNextNote(firstNote);
    let minorSecond = getNote(minorSecondName);
    let majorSecondName =  getNextNote(minorSecondName);
    let majorSecond = getNote(majorSecondName);
    let minorThirdName =  getNextNote(majorSecondName);
    let minorThird = getNote(minorThirdName);

    let duration = 0.4;
    if (speed === 'slow') {
        duration = 0.45;
    } else if (speed === 'fast') {
        duration = 0.35;
    }

    for (let i = 0; i < 2; ++i)
    {
        generatePause(soundData, duration / 2);
        generateSound(soundData, minorThird, duration / 2);
        generateSound(soundData, majorSecond, duration / 2);
        generatePause(soundData, duration / 2);
        generateSound(soundData, minorSecond, duration / 2);
        generateSound(soundData, fundamental, (i == 0) ? duration * 2 : duration);
        generatePause(soundData, (i == 0) ? duration : duration / 4);
    }

    if (shouldModulate) {
        generateSound(soundData, fundamental, duration);
        generatePause(soundData, duration / 3);
        generateSound(soundData, getNote(getPreviousNote(firstNote)), duration / 2);
    }
}

let generators = [
    { generator: warmup1Generator, ascending: true },
    { generator: warmup2Generator, ascending: true },
    { generator: warmup3Generator, ascending: true },
    { generator: warmup4Generator, ascending: true },
    { generator: warmup5Generator, ascending: false },
    { generator: warmup6Generator, ascending: true },
    { generator: warmup7Generator, ascending: false },
    { generator: warmup8Generator, ascending: true },
    { generator: warmup9Generator, ascending: true },
    { generator: warmup10Generator, ascending: false },
];

function generateFullWarmup(params) {
    /* Params example:
    [
        { exerciseId: 0, range: { begin: 10, end: 20 },
        { exerciseId: 2, range: { begin: 5, end: 20 }
    ]
    */
    if (!params) {
        console.log('No params! Aborting...');
        return { error: 'no_params' };
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
            return { error: 'invalid_exercise_params' };
        }

        exercise.range.begin = parseInt(exercise.range.begin);
        exercise.range.end = parseInt(exercise.range.end);

        if (exercise.range.begin < 1 || !exercise.range.begin > !exercise.range.end || exercise.range.end > 50) {
            console.log(`Invalid range! Aborting at exercise ${i}... exercise were:`, exercise);
            console.log('Expected format: { exerciseId: 0, range: { begin: 10, end: 20 }');
            return { error: 'invalid_range' };
        }

        let range = exercise.range.end - exercise.range.begin + 1;
        let initialNote = 'C3';
        for (let j = 0; j < exercise.range.begin; ++j) {
            initialNote = getNextNote(initialNote);
        }
        if (!generators[exercise.exerciseId - 1]) {
            console.log(`Invalid generator! No predefined exercise with ID ${exercise.exerciseId}! Aborting...`);
            return { error: 'unknown_exercise' };
        }

        let speed = 'normal';
        if (exercise.speed && exercise.speed === 'slow' || exercise.speed === 'fast') {
            speed = exercise.speed;
        }

        generateWarmup(generators[exercise.exerciseId - 1].generator, initialNote, range, generators[exercise.exerciseId - 1].ascending, speed);
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

    return { filename: `${filename}.wav` };
};

module.exports = generateFullWarmup;
