//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Path = 
    require("path");
const RIFFLib = 
    require("./../../");

//  Imported classes.
const RIFFFileReadAccessor = 
    RIFFLib.IO.RIFFFileReadAccessor;
const RIFFFileWriteAccessor = 
    RIFFLib.IO.RIFFFileWriteAccessor;
const RIFFMemoryReadAccessor = 
    RIFFLib.IO.RIFFMemoryReadAccessor;
const RIFFFourCC = 
    RIFFLib.Blocks.RIFFFourCC;
const RIFFFormElementDeserializer = 
    RIFFLib.Tree.RIFFFormElementDeserializer;
const RIFFFormElement = 
    RIFFLib.Tree.RIFFFormElement;
const RIFFListElementDeserializer = 
    RIFFLib.Tree.RIFFListElementDeserializer;
const RIFFListElement = 
    RIFFLib.Tree.RIFFListElement;
const RIFFRawElementDeserializer = 
    RIFFLib.Tree.RIFFRawElementDeserializer;
const RIFFRawElement = 
    RIFFLib.Tree.RIFFRawElement;
const RIFFZStringElementDeserializer = 
    RIFFLib.Tree.RIFFZStringElementDeserializer;
const RIFFZStringElement = 
    RIFFLib.Tree.RIFFZStringElement;

//  Imported functions.
const CopyBetweenAccessors = 
    RIFFLib.IO.Utils.CopyBetweenAccessors;

//
//  Constants.
//

//  wFormatTag values.
const WAVE_FORMAT_PCM = 0x0001;

//  Sine frequency (Hz) and amplitude.
const SINE_AMPLITUDE = 100;
const SINE_FREQUENCY = 440;

//  Total time (seconds).
const TOTAL_TIME = 1;

//  Sample rate.
const SAMPLE_RATE = 44100;

//
//  Main.
//
(async function() {
    //  Open the file.
    let file_out = await RIFFFileWriteAccessor.Open(
        Path.join(__dirname, "test.wav")
    );

    //  Generate PCM.
    let samples = [];
    let time = 0;
    let dt_per_sample = 1.0 / SAMPLE_RATE;
    while (time < TOTAL_TIME) {
        samples.push(
            SINE_AMPLITUDE * Math.sin(2 * Math.PI * SINE_FREQUENCY * time)
        );
        time += dt_per_sample;
    }
    let pcm = Buffer.allocUnsafe(samples.length);
    for (let i = 0; i < samples.length; ++i) {
        pcm.writeInt8(Math.floor(samples[i]), i);
    }

    //  Build wavefile structure.
    let fmtck_data = Buffer.allocUnsafe(16);
    fmtck_data.writeUInt16LE(WAVE_FORMAT_PCM, 0);   //  wFormatTag
    fmtck_data.writeUInt16LE(1, 2);                 //  wChannels
    fmtck_data.writeUInt32LE(SAMPLE_RATE, 4);       //  dwSamplesPerSec
    fmtck_data.writeUInt32LE(50000, 8);             //  dwAvgBytesPerSec
    fmtck_data.writeUInt16LE(1, 12);                //  wBlockAlign
    fmtck_data.writeUInt16LE(8, 14);                //  wBitsPerSample
    let fmtck = new RIFFRawElement(RIFFFourCC.FromString("fmt"));
    fmtck.setDataAccessor(RIFFMemoryReadAccessor.FromBuffer(fmtck_data));
    fmtck.setDataLength(fmtck_data.length);

    let wavedata = new RIFFRawElement(RIFFFourCC.FromString("data"));
    wavedata.setDataAccessor(RIFFMemoryReadAccessor.FromBuffer(pcm));
    wavedata.setDataLength(pcm.length);

    let waveform = new RIFFFormElement(RIFFFourCC.FromString("WAVE"));
    waveform.addChild(fmtck);
    waveform.addChild(wavedata);

    //  Serialize and write to the file.
    await (await waveform.serialize()).write(file_out);

    //  Close the file.
    await file_out.end();
})().catch(function(error) {
    console.error(error);
});