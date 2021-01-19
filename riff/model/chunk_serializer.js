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
const RiIoAccessor = 
    require("./../io/accessor");
const RiIoMemAccessor = 
    require("./../io/mem_accessor");
const RiIoMsegAccessor = 
    require("./../io/mseg_accessor");
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
const RIFFMemoryReadAccessor = 
    RiIoMemAccessor.RIFFMemoryReadAccessor;
const RIFFMultiSegmentReadAccessor = 
    RiIoMsegAccessor.RIFFMultiSegmentReadAccessor;
const RIFFMultiSegmentReadAccessorFactory = 
    RiIoMsegAccessor.RIFFMultiSegmentReadAccessorFactory;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const ConditionalSynchronizer = 
    XRTLibAsync.Synchronize.Conditional.ConditionalSynchronizer;

//
//  Imported constants.
//
const BIG_ENDIAN = 
    RiIoEndianness.BIG_ENDIAN;
const LITTLE_ENDIAN = 
    RiIoEndianness.LITTLE_ENDIAN;

//
//  Constants.
//

//  I/O buffer size.
const IO_BUFSIZE = 4096;

//  Pad zero.
const PAD_ZERO = Buffer.from([0x00]);

//  Pad byte accessor.
const PADBYTE_ACCESSOR = RIFFMemoryReadAccessor.FromBuffer(Buffer.from([0x00]));

//
//  Classes.
//

/**
 *  RIFF chunk serializer output.
 * 
 *  @constructor
 *  @param {IRIFFReadAccessor} srDataAccessor
 *    - The serialized data accessor.
 *  @param {Number} srDataLength
 *    - The serialized data length.
 */
function RIFFChunkSerializerOutput(
    srDataAccessor,
    srDataLength
) {
    //
    //  Public methods.
    //

    /**
     *  Get the serialized data accessor.
     * 
     *  @returns {IRIFFReadAccessor}
     *    - The serialized data accessor.
     */
    this.getDataAccessor = function() {
        return srDataAccessor;
    };

    /**
     *  Get the serialized data length.
     * 
     *  @returns {Number}
     *    - The serialized data length.
     */
    this.getDataLength = function() {
        return srDataLength;
    };
}

/**
 *  RIFF chunk serializer options.
 * 
 *  @constructor
 */
function RIFFChunkSerializerOption() {
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

/**
 *  RIFF chunk serializer.
 * 
 *  @constructor
 *  @param {RIFFChunkSerializerOption} [options]
 *    - The options.
 */
function RIFFChunkSerializer(
    options = new RIFFChunkSerializerOption()
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
     *  Serialize a chunk.
     * 
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @param {RIFFChunk} ck
     *    - The chunk.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<RIFFChunkSerializerOutput>}
     *    - The promise object (resolves with the serialization output if 
     *      succeed, rejects if error occurred).
     */
    this.serialize = async function(
        ck,
        cancellator = new ConditionalSynchronizer()
    ) {
        let srDataAccessorFactory = new RIFFMultiSegmentReadAccessorFactory();

        //  Serialize the chunk ID.
        srDataAccessorFactory.add(
            RIFFMemoryReadAccessor.FromBuffer(ck.getChunkID().getBytes()), 
            4
        );

        //  Serialize the chunk data length.
        let ckDataLength = ck.getChunkDataLength();
        let ckDataLengthRaw = Buffer.allocUnsafe(4);
        if (endianness == LITTLE_ENDIAN) {
            ckDataLengthRaw.writeUInt32LE(ckDataLength, 0);
        } else {
            ckDataLengthRaw.writeUInt32BE(ckDataLength, 0);
        }
        srDataAccessorFactory.add(
            RIFFMemoryReadAccessor.FromBuffer(ckDataLengthRaw), 
            4
        );

        //  Serialize the chunk data.
        srDataAccessorFactory.add(
            ck.getChunkDataAccessor(),
            ckDataLength
        );
        let srDataLength = 8 + ckDataLength;
        if (aligned && ((ckDataLength & 1) != 0)) {
            srDataAccessorFactory.add(PADBYTE_ACCESSOR, 1);
            ++(srDataLength);
        }

        return new RIFFChunkSerializerOutput(
            srDataAccessorFactory.create(),
            srDataLength
        );
    };
}

//  Export public APIs.
module.exports = {
    "RIFFChunkSerializerOption": RIFFChunkSerializerOption,
    "RIFFChunkSerializer": RIFFChunkSerializer
};