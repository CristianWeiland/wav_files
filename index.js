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

    console.log(formatData);

    //const garbage = yield ARCSECOND.str('LIST   INFOISFT   Lavf58.45.100');
    //const garbage = ARCSECOND.everyCharUntil(ARCSECOND.str('data'));
    //console.log(garbage);
    //console.log('lalala');
    //const id2 = yield ARCSECOND.str('LIST                                     ');
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

console.log(output.result);

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

//isUpFrequency = getRandomInt(0, 200);
isUpFrequency = 100;

const noSound = 1000000000;
const AFreq = 440;
const A3 = Math.floor(sampleRate / AFreq);
const A2 = Math.floor(A3 * 2);
const A4 = Math.floor(A3 / 2)
const volume = 5000;

function generateSound(soundData, waveFrequency, durationInSecs, volume = 5000) {
    let durationInSamples = sampleRate * durationInSecs;
    for (let i = 0; i < durationInSamples; ++i) {
        if (i % waveFrequency === 0) {
            isUp = !isUp;
        }
        let sampleValue = isUp ? volume : -volume;
    
        soundData.push(sampleValue);
    }
}

function oneOctaveHigher(frequency) {
    return Math.floor(frequency / 2);
}
function oneOctaveLower(frequency) {
    return Math.floor(frequency * 2);
}
function oneSemitoneHigher(frequency) {
    return Math.floor(frequency / 1.059463);
}
function oneSemitoneLower(frequency) {
    return Math.floor(frequency * 1.059463);
}

generateSound(soundData, A3, 1);
generateSound(soundData, oneSemitoneHigher(A3), 1);
generateSound(soundData, 1, 1, 0);
generateSound(soundData, oneSemitoneHigher(oneSemitoneHigher(oneSemitoneHigher(A3))), 1);
//generateSound(soundData, A4, 1);
//generateSound(soundData, A2, 1);

//for (let i = 0; i < 44100 * 2; ++i) {
//    /*if (i % 2000 === 0) {
//        isUpFrequency = getRandomInt(0, 200);
//    }*/
//
//    if (i % isUpFrequency === 0) {
//        isUp = !isUp;
//    }
//    /*let sampleValue = getRandomInt(0, 5000);
//    sampleValue = isUp ? sampleValue : -sampleValue;*/
//    //let sampleValue = isUp ? 5000 : - 5000;
//    let sampleValue = isUp ? 5000 : -5000;
//    /*if (getRandomInt(0, 10) > 5) {
//        sampleValue = sampleValue / 2;
//    }*/
//
//    soundData.push(sampleValue);
//}

dataSubChunkStruct.get('data').set(soundData);
dataSubChunkStruct.get('size').set(soundData.length * 2);

const totalSize = dataSubChunkStruct.computeBufferSize() + riffChunkStruct.computeBufferSize() + formatChunkStruct.computeBufferSize();

const fileStruct = CONSTRUCT.Struct('waveFile')
    .field('riffChunk', riffChunkStruct)
    .field('formatChunkStruct', formatChunkStruct)
    .field('dataSubChunkStruct', dataSubChunkStruct);

FS.writeFileSync(PATH.join(__dirname, './new.wav'), fileStruct.toBuffer());