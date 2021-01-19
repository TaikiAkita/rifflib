//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const RiIoEndianness = 
    require("./../riff/io/endianness");
const RiIoAccessor = 
    require("./../riff/io/accessor");
const RiIoFileAccessor = 
    require("./../riff/io/file_accessor");
const RiIoMemAccessor = 
    require("./../riff/io/mem_accessor");
const RiIoStreamAccessor = 
    require("./../riff/io/stream_accessor");
const RiMdFourCC = 
    require("./../riff/model/fourcc");
const RiTrElement = 
    require("./../riff/tree/element");
const RiTrFormElement = 
    require("./../riff/tree/form_element");
const RiTrListElement = 
    require("./../riff/tree/list_element");
const RiTrRawElement = 
    require("./../riff/tree/raw_element");
const RiTrZStrElement = 
    require("./../riff/tree/zstr_element");
const RiTrStream = 
    require("./../riff/tree/stream");
const RiError = 
    require("./../error");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const IRIFFWriteAccessor = 
    RiIoAccessor.IRIFFWriteAccessor;
const RIFFFileReadAccessor = 
    RiIoFileAccessor.RIFFFileReadAccessor;
const RIFFFileWriteAccessor = 
    RiIoFileAccessor.RIFFFileWriteAccessor;
const RIFFMemoryReadAccessor = 
    RiIoMemAccessor.RIFFMemoryReadAccessor;
const RIFFMemoryWriteAccessor = 
    RiIoMemAccessor.RIFFMemoryWriteAccessor;
const RIFFStreamReadAccessor = 
    RiIoStreamAccessor.RIFFStreamReadAccessor;
const RIFFFourCC = 
    RiMdFourCC.RIFFFourCC;
const IRIFFElement = 
    RiTrElement.IRIFFElement;
const IRIFFElementDeserializer = 
    RiTrElement.IRIFFElementDeserializer;
const RIFFElementDeserializerOption = 
    RiTrElement.RIFFElementDeserializerOption;
const RIFFElementDeserializerOutput = 
    RiTrElement.RIFFElementDeserializerOutput;
const RIFFElementSerializerOption = 
    RiTrElement.RIFFElementSerializerOption;
const RIFFElementSerializerOutput = 
    RiTrElement.RIFFElementSerializerOutput;
const RIFFFormElement = 
    RiTrFormElement.RIFFFormElement;
const RIFFFormElementDeserializer = 
    RiTrFormElement.RIFFFormElementDeserializer;
const RIFFListElement = 
    RiTrListElement.RIFFListElement;
const RIFFListElementDeserializer = 
    RiTrListElement.RIFFListElementDeserializer;
const RIFFRawElement = 
    RiTrRawElement.RIFFRawElement;
const RIFFRawElementDeserializer = 
    RiTrRawElement.RIFFRawElementDeserializer;
const RIFFZStringElement = 
    RiTrZStrElement.RIFFZStringElement;
const RIFFZStringElementDeserializer = 
    RiTrZStrElement.RIFFZStringElementDeserializer;
const RIFFElementDeserializationStream = 
    RiTrStream.RIFFElementDeserializationStream;
const RIFFElementSerializationStreamAccessor = 
    RiTrStream.RIFFElementSerializationStreamAccessor;
const RIFFElementSerializationStream = 
    RiTrStream.RIFFElementSerializationStream;
const RIFFError = 
    RiError.RIFFError;
const RIFFBugError = 
    RiError.RIFFBugError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const RIFFInvalidOperationError = 
    RiError.RIFFInvalidOperationError;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const RIFFSerializeError = 
    RiError.RIFFSerializeError;
const RIFFDeserializeError = 
    RiError.RIFFDeserializeError;
const RIFFDeserializerExistedError = 
    RiError.RIFFDeserializerExistedError;
const RIFFDeserializerNotExistsError = 
    RiError.RIFFDeserializerNotExistsError;
const RIFFIOError = 
    RiError.RIFFIOError;

//  Imported constants.
const BIG_ENDIAN = 
    RiIoEndianness.BIG_ENDIAN;
const LITTLE_ENDIAN = 
    RiIoEndianness.LITTLE_ENDIAN;

//  Imported functions.
const CopyBetweenAccessors = 
    RiIoAccessor.CopyBetweenAccessors;

//  Export public APIs.
module.exports = {
    "Endianness": {
        "BIG_ENDIAN": 
            BIG_ENDIAN,
        "LITTLE_ENDIAN": 
            LITTLE_ENDIAN
    },
    "IO": {
        "Utils": {
            "CopyBetweenAccessors": 
                CopyBetweenAccessors
        },
        "IRIFFReadAccessor": 
            IRIFFReadAccessor,
        "IRIFFWriteAccessor": 
            IRIFFWriteAccessor,
        "RIFFFileReadAccessor": 
            RIFFFileReadAccessor,
        "RIFFFileWriteAccessor": 
            RIFFFileWriteAccessor,
        "RIFFMemoryReadAccessor": 
            RIFFMemoryReadAccessor,
        "RIFFMemoryWriteAccessor": 
            RIFFMemoryWriteAccessor,
        "RIFFStreamReadAccessor": 
            RIFFStreamReadAccessor
    },
    "Blocks": {
        "RIFFFourCC": 
            RIFFFourCC
    },
    "Tree": {
        "Stream": {
            "RIFFElementDeserializationStream": 
                RIFFElementDeserializationStream,
            "RIFFElementSerializationStreamAccessor": 
                RIFFElementSerializationStreamAccessor,
            "RIFFElementSerializationStream": 
                RIFFElementSerializationStream
        },
        "IRIFFElement": 
            IRIFFElement,
        "IRIFFElementDeserializer": 
            IRIFFElementDeserializer,
        "RIFFElementDeserializerOption": 
            RIFFElementDeserializerOption,
        "RIFFElementDeserializerOutput": 
            RIFFElementDeserializerOutput,
        "RIFFElementSerializerOption": 
            RIFFElementSerializerOption,
        "RIFFElementSerializerOutput": 
            RIFFElementSerializerOutput,
        "RIFFRawElement": 
            RIFFRawElement,
        "RIFFRawElementDeserializer": 
            RIFFRawElementDeserializer,
        "RIFFFormElement": 
            RIFFFormElement,
        "RIFFFormElementDeserializer": 
            RIFFFormElementDeserializer,
        "RIFFListElement": 
            RIFFListElement,
        "RIFFListElementDeserializer": 
            RIFFListElementDeserializer,
        "RIFFZStringElement": 
            RIFFZStringElement,
        "RIFFZStringElementDeserializer": 
            RIFFZStringElementDeserializer
    },
    "Errors": {
        "RIFFError": 
            RIFFError,
        "RIFFBugError": 
            RIFFBugError,
        "RIFFParameterError": 
            RIFFParameterError,
        "RIFFInvalidOperationError": 
            RIFFInvalidOperationError,
        "RIFFOperationCancelledError": 
            RIFFOperationCancelledError,
        "RIFFSerializeError": 
            RIFFSerializeError,
        "RIFFDeserializeError": 
            RIFFDeserializeError,
        "RIFFDeserializerExistedError": 
            RIFFDeserializerExistedError,
        "RIFFDeserializerNotExistsError": 
            RIFFDeserializerNotExistsError,
        "RIFFIOError": 
            RIFFIOError
    }
};