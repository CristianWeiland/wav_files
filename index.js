const ARCSECOND = require('arcsecond');
const ARCSECOND_BINARY = require('arcsecond-binary');
const CONSTRUCT = require('construct-js');
const FS = require('fs');
const PATH = require('path');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
}

//const file = FS.readFileSync(PATH.join(__dirname, './resources/Of-Reality-Eclipse.wav'));
const file = FS.readFileSync(PATH.join(__dirname, './resources/noise.wav'));

const riffChunkSize = ARCSECOND_BINARY.u32LE.chain(size => {
    if (size !== file.length - 8) {
        return ARCSECOND.fail(`Invalid file size: ${file.length}. Expected ${size}`);
    }
    return ARCSECOND.succeedWith(size);
})

const riffChunk = ARCSECOND.sequenceOf([
    ARCSECOND.str('RIFF'),
    riffChunkSize,
    ARCSECOND.str('WAVE'),
]);

const formatSubchunk = ARCSECOND.coroutine(function* () {
    const id = yield ARCSECOND.str('fmt ');
    const subChunk1Size = yield ARCSECOND_BINARY.u32LE;
    const audioFormat = yield ARCSECOND_BINARY.u16LE;
    const numChannels = yield ARCSECOND_BINARY.u16LE;
    const sampleRate = yield ARCSECOND_BINARY.u32LE;
    const byteRate = yield ARCSECOND_BINARY.u32LE;
    const blockAlign = yield ARCSECOND_BINARY.u16LE;
    const bitsPerSample = yield ARCSECOND_BINARY.u16LE;

    const expectedByteRate = sampleRate * numChannels * bitsPerSample / 8;
    if (byteRate !== expectedByteRate) {
        yield ARCSECOND.fail(`Invalid byte rate: ${byteRate}, expected ${expectedByteRate}`);
    }

    const expectedBlockAlign = numChannels * bitsPerSample / 8;
    if (blockAlign !== expectedBlockAlign) {
        yield ARCSECOND.fail(`Invalid byte align: ${byteAlign}, expected ${expectedByteAlign}`);
    }

    const formatChunkData = {
        id,
        subChunk1Size,
        audioFormat,
        numChannels,
        sampleRate,
        byteRate,
        blockAlign,
        bitsPerSample,
    };

    yield ARCSECOND.setData(formatChunkData);

    return formatChunkData;
});

const dataSubChunk = ARCSECOND.coroutine(function* () {
    const formatData = yield ARCSECOND.getData;

    //console.log(formatData);

    const id = yield ARCSECOND.str('data');
    const size = yield ARCSECOND_BINARY.u32LE;

    const samples = size / formatData.numChannels / (formatData.bitsPerSample / 8);
    const channelData = Array.from({ length: formatData.numChannels }, () => []);

    console.log(samples);

    let sampleParser;
    if (formatData.bitsPerSample === 8) {
        sampleParser = ARCSECOND_BINARY.s8;
    } else if (formatData.bitsPerSample === 16) {
        sampleParser = ARCSECOND_BINARY.s16LE;
    } else if (formatData.bitsPerSample === 32) {
        sampleParser = ARCSECOND_BINARY.s32LE;
    } else {
        ARCSECOND.fail(`Unsupported bits per sample: ${formatData.bitsPerSample}`);
    }
    for (let sampleIndex = 0; sampleIndex < samples; ++sampleIndex) {
        for (let channelIndex = 0; channelIndex < formatData.numChannels; ++channelIndex) {
            const sampleValue = yield sampleParser;
            channelData[channelIndex].push(sampleValue);
        }
    }

    return {
        id,
        size,
        channelData,
    };
});
    

const parser = ARCSECOND.sequenceOf([
    riffChunk,
    formatSubchunk,
    //ARCSECOND.everythingUntil(ARCSECOND.str('Lavf58')),
    //ARCSECOND.everythingUntil(ARCSECOND.str('data')),
    dataSubChunk,
    ARCSECOND.endOfInput,
]).map(([ riffChunk, formatSubChunk, dataSubChunk ]) => ({
    riffChunk,
    formatSubChunk,
    dataSubChunk,
}));

const output = parser.run(file.buffer);

if (output.isError) {
    throw new Error(output.error);
}

//console.log(output.result);

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
let isUp = true;

isUpFrequency = 100;

const AFreq = 440;
const A4 = Math.floor(sampleRate / AFreq);

// 0.5 ok
// 0.25 ok
// 0.05 ok
// 0.01 ok

function generateSound(soundData, waveFrequency, durationInSecs, volume = 5000) {
    if (durationInSecs < 1) {
        let allowedValues = [0.5, 0.2, 0.25, 0.05, 0.04, 0.02, 0.01];

        if (!allowedValues.find(val => val === durationInSecs)) {
            console.log(`Duration in secs smaller than 1 should be one between [${allowedValues.join(', ')}]. Found ${durationInSecs}`);
        }
    }
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

function generateSoundByArray(soundData, soundArray) {
    soundArray.forEach(sound => {
        if (sound.pause) {
            generatePause(soundData, sound.duration);
        } else {
            generateSound(soundData, getNote(sound.note), sound.duration);
        }
    });
}

/*
console.log(`Distance from B4: ${distanceFromA4('B4')}`);
console.log(`Distance from G4: ${distanceFromA4('G4')}`);
console.log(`Distance from B3: ${distanceFromA4('B3')}`);
console.log(`Distance from G3: ${distanceFromA4('G3')}`);
console.log(`Distance from C2: ${distanceFromA4('C2')}`);
console.log(`Distance from Gb4: ${distanceFromA4('Gb4')}`);
console.log(`Distance from G#4: ${distanceFromA4('G#4')}`);
*/

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

dataSubChunkStruct.get('data').set(soundData);
dataSubChunkStruct.get('size').set(soundData.length * 2);

const totalSize = dataSubChunkStruct.computeBufferSize() + riffChunkStruct.computeBufferSize() + formatChunkStruct.computeBufferSize();

const fileStruct = CONSTRUCT.Struct('waveFile')
    .field('riffChunk', riffChunkStruct)
    .field('formatChunkStruct', formatChunkStruct)
    .field('dataSubChunkStruct', dataSubChunkStruct);

FS.writeFileSync(PATH.join(__dirname, './new.wav'), fileStruct.toBuffer());