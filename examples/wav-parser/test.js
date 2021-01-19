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
const IBM_FORMAT_MULAW = 0x0101;
const IBM_FORMAT_ALAW = 0x0102;
const IBM_FORMAT_ADPCM = 0x0103;

//
//  Main.
//
(async function() {
    //  Open the file.
    let file_in = await RIFFFileReadAccessor.Open(
        Path.join(__dirname, "test.wav")
    );
    let file_out = await RIFFFileWriteAccessor.Open(
        Path.join(__dirname, "test.pcm")
    );

    //  Create a wavefile deserializer.
    let infolist_dsl = new RIFFListElementDeserializer(
        RIFFFourCC.FromString("INFO")
    );
    infolist_dsl.useChildDeserializer(new RIFFZStringElementDeserializer(
        RIFFFourCC.FromString("INAM")
    ));
    infolist_dsl.useChildDeserializer(new RIFFZStringElementDeserializer(
        RIFFFourCC.FromString("IART")
    ));
    infolist_dsl.useChildDeserializer(new RIFFZStringElementDeserializer(
        RIFFFourCC.FromString("ICRD")
    ));
    let wavefile_dsl = new RIFFFormElementDeserializer(
        RIFFFourCC.FromString("WAVE")
    );
    wavefile_dsl.useChildDeserializer(infolist_dsl);

    //  Deserialize the wavefile.
    let wavefile = (await wavefile_dsl.deserialize(file_in)).getElement();

    //  Extract information from the file.
    let fmtck_wFormatTag = null;
    let fmtck_szFormatTag = null;
    let fmtck_wChannels = null;
    let fmtck_dwSamplesPerSec = null;
    let fmtck_dwAvgBytesPerSec = null;
    let fmtck_wBlockAlign = null;
    let pcm_wBitsPerSample = null;
    let info_inam = null;
    let info_iart = null;
    let info_icrd = null;
    for (let i = 0; i < wavefile.getChildrenCount(); ++i) {
        let wavefile_child = wavefile.getChildAt(i);
        let wavefile_childname = wavefile_child.getName().toString();
        if (wavefile_childname == "fmt") {
            let fmt = await wavefile_child.getDataAccessor().read(
                0, 
                wavefile_child.getDataLength()
            );
            if (fmt.length < 14) {
                throw new Error("<fmt-ck> was truncated.");
            }
            fmtck_wFormatTag = fmt.readUInt16LE(0);
            switch (fmtck_wFormatTag) {
            case WAVE_FORMAT_PCM:
                fmtck_szFormatTag = "WAVE_FORMAT_PCM";
                if (fmt.length < 16) {
                    throw new Error("<PCM-format-specific> was truncated.");
                }
                pcm_wBitsPerSample = fmt.readUInt16LE(14);
                break;
            case IBM_FORMAT_MULAW:
                fmtck_szFormatTag = "IBM_FORMAT_MULAW";
                break;
            case IBM_FORMAT_ALAW:
                fmtck_szFormatTag = "IBM_FORMAT_ALAW";
                break;
            case IBM_FORMAT_ADPCM:
                fmtck_szFormatTag = "IBM_FORMAT_ADPCM";
                break;
            default:
                fmtck_szFormatTag = "UNKNOWN";
            }
            fmtck_wChannels = fmt.readUInt16LE(2);
            fmtck_dwSamplesPerSec = fmt.readUInt32LE(4);
            fmtck_dwAvgBytesPerSec = fmt.readUInt16LE(8);
            fmtck_wBlockAlign = fmt.readUInt16LE(12);
        } else if (wavefile_childname == "LIST") {
            if (!(wavefile_child instanceof RIFFListElement)) {
                continue;
            }
            let listtype = wavefile_child.getListType().toString();
            if (listtype == "INFO") {
                for (let j = 0; j < wavefile_child.getChildrenCount(); ++j) {
                    let listitem = wavefile_child.getChildAt(j);
                    if (!(listitem instanceof RIFFZStringElement)) {
                        continue;
                    }
                    switch (listitem.getName().toString()) {
                    case "INAM":
                        info_inam = listitem.getStringBytes().toString("ascii");
                        break;
                    case "IART":
                        info_iart = listitem.getStringBytes().toString("ascii");
                        break;
                    case "ICRD":
                        info_icrd = listitem.getStringBytes().toString("ascii");
                        break;
                    default:
                        break;
                    }
                }
            }
        } else if (wavefile_childname == "data") {
            if (wavefile_child instanceof RIFFRawElement) {
                //  Dump to PCM.
                await CopyBetweenAccessors(
                    wavefile_child.getDataAccessor(), 
                    file_out, 
                    wavefile_child.getDataLength()
                );
            }
        }
    }

    //  Print wavefile information.
    console.log("Wavefile Information");
    console.log("====================");
    console.log("Format: " + fmtck_szFormatTag);
    if (pcm_wBitsPerSample !== null) {
        console.log("Bits per sample: " + pcm_wBitsPerSample.toString());
    }
    console.log("Channels: " + fmtck_wChannels.toString());
    console.log(
        "Average bytes per second: " + 
        fmtck_dwAvgBytesPerSec.toString()
    );
    console.log("Block align: " + fmtck_wBlockAlign.toString());
    console.log("Sample rate: " + fmtck_dwSamplesPerSec.toString());
    if (info_inam !== null) {
        console.log("File information (Title): " + info_inam);
    }
    if (info_iart !== null) {
        console.log("File information (Artist): " + info_iart);
    }
    if (info_icrd !== null) {
        console.log("File information (Year): " + info_icrd);
    }

    //  Close the file.
    await file_in.end();
    await file_out.end();
})().catch(function(error) {
    console.error(error);
});