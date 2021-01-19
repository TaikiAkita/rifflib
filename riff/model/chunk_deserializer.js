//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const RiMdChunk = 
    require("./chunk");
const RiMdFourCC = 
    require("./fourcc");
const RiIoAccessor = 
    require("./../io/accessor");
const RiIoEndianness = 
    require("./../io/endianness");
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");

//  Imported classes.
const RIFFChunk = 
    RiMdChunk.RIFFChunk;
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const IRIFFWriteAccessor = 
    RiIoAccessor.IRIFFWriteAccessor;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const ConditionalSynchronizer = 
    XRTLibAsync.Synchronize.Conditional.ConditionalSynchronizer;
const RIFFFourCC = 
    RiMdFourCC.RIFFFourCC;

//
//  Imported constants.
//
const BIG_ENDIAN = 
    RiIoEndianness.BIG_ENDIAN;
const LITTLE_ENDIAN = 
    RiIoEndianness.LITTLE_ENDIAN;

//
//  Classes.
//

/**
 *  RIFF chunk deserializer options.
 * 
 *  @constructor
 */
function RIFFChunkDeserializerOption() {
    //
    //  Members.
    //

    //  Word alignment flag.
    let alignedWd = true;

    //  Endianness.
    let endianness = LITTLE_ENDIAN;

    //
    //  Public methods.
    //

    /**
     *  Get whether word alignment is enabled.
     * 
     *  @returns {Boolean}
     *    - True if so.
     */
    this.isWordAligned = function() {
        return alignedWd;
    };

    /**
     *  Set whether word alignment is enabled.
     * 
     *  @param {Boolean} aligned
     *    - True if word alignment is enabled.
     */
    this.setWordAligned = function(aligned) {
        alignedWd = aligned;
    };

    /**
     *  Get the endianness.
     * 
     *  @returns {Number}
     *    - The endianness (either BIG_ENDIAN or LITTLE_ENDIAN).
     */
    this.getEndianness = function() {
        return endianness;
    };

    /**
     *  Set the endianness.
     * 
     *  @throws {RIFFParameterError}
     *    - Invalid endianness.
     *  @param {Number} edn
     *    - The endianness (either BIG_ENDIAN or LITTLE_ENDIAN).
     */
    this.setEndianness = function(edn) {
        switch (edn) {
        case BIG_ENDIAN:
        case LITTLE_ENDIAN:
            endianness = edn;
            break;
        default:
            throw new RIFFParameterError("Invalid endianness.");
        }
    };
}

//  Generic deserializer option.
RIFFChunkDeserializerOption.GENERIC_OPTION = 
    new RIFFChunkDeserializerOption();

//  MIDI deserializer option.
RIFFChunkDeserializerOption.MIDI_OPTION = (function() {
    let opt = new RIFFChunkDeserializerOption();
    opt.setEndianness(BIG_ENDIAN);
    opt.setWordAligned(false);
    return opt;
})();

/**
 *  RIFF chunk deserializer output.
 * 
 *  @constructor
 *  @param {RIFFChunk} chunk
 *    - The chunk.
 *  @param {Number} offsetNext
 *    - The offset of the next chunk.
 */
function RIFFChunkDeserializerOutput(
    chunk,
    offsetNext
) {
    //
    //  Public methods.
    //

    /**
     *  Get the chunk.
     * 
     *  @returns {RIFFChunk}
     *    - The chunk.
     */
    this.getChunk = function() {
        return chunk;
    };

    /**
     *  Get the offset of the next chunk.
     * 
     *  @returns {Number}
     *    - The next offset.
     */
    this.getNextOffset = function() {
        return offsetNext;
    };
}

/**
 *  RIFF chunk deserializer.
 * 
 *  @constructor
 *  @param {RIFFChunkDeserializerOption} [options]
 *    - The options.
 */
function RIFFChunkDeserializer(
    options = RIFFChunkDeserializerOption.GENERIC_OPTION
) {
    //
    //  Members.
    //

    //  Endianness.
    let endianness = options.getEndianness();

    //  Word aligned.
    let aligned = options.isWordAligned();

    //
    //  Public methods.
    //

    /**
     *  Deserialize a chunk.
     * 
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @throws {RIFFParameterError}
     *    - One of following errors occurred:
     *      - Invalid beginning offset.
     *      - Invalid ending offset.
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @param {IRIFFReadAccessor} accessor
     *    - The serialized data accessor.
     *  @param {Number} [start]
     *    - The beginning offset.
     *  @param {Number} [end]
     *    - The ending offset.
     *      - -1 if ending offset is not set.
     *      - Any integer larger than the beginning offset if ending offset is 
     *        set.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<RIFFChunkDeserializerOutput>}
     *    - The promise object (resolves with the deserialization output if 
     *      succeed, rejects if error occurred).
     */
    this.deserialize = async function(
        accessor,
        start = 0,
        end = -1,
        cancellator = new ConditionalSynchronizer()
    ) {
        //  Check the beginning offset.
        if (!(Number.isInteger(start) && start >= 0)) {
            throw new RIFFParameterError("Invalid beginning offset ");
        }

        //  Check the ending offset.
        if (end != -1) {
            if (!(Number.isInteger(end) && end > start)) {
                throw new RIFFParameterError("Invalid ending offset.");
            }
        } else {
            end = Infinity;
        }

        //  Read the header.
        if (start + 8 > end) {
            throw new RIFFIOError("Data truncated.");
        }
        let hdr = await accessor.read(start, 8, cancellator);

        //  Parse the chunk ID.
        let ckId = new RIFFFourCC(hdr.slice(0, 4));

        //  Parse the chunk data length.
        let ckDataLenRaw = hdr.slice(4, 8);
        let ckDataLen = (
            endianness == LITTLE_ENDIAN ?
            ckDataLenRaw.readUInt32LE(0) :
            ckDataLenRaw.readUInt32BE(0)
        );

        //  Check the chunk data length.
        if (start + 8 + ckDataLen > end) {
            throw new RIFFIOError("Data truncated.");
        }

        //  Build the chunk.
        let ck = new RIFFChunk(
            ckId, 
            accessor.sub(start + 8),
            ckDataLen
        );

        //  Get the offset of the next chunk.
        let offsetNext = start + 8 + ckDataLen;
        if (aligned && ((ckDataLen & 1) != 0)) {
            ++(offsetNext);
        }

        return new RIFFChunkDeserializerOutput(
            ck,
            offsetNext
        );
    };
}

//  Export public APIs.
module.exports = {
    "RIFFChunkDeserializerOutput": RIFFChunkDeserializerOutput,
    "RIFFChunkDeserializerOption": RIFFChunkDeserializerOption,
    "RIFFChunkDeserializer": RIFFChunkDeserializer
};