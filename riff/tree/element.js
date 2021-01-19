//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const RiIoAccessor = 
    require("./../io/accessor");
const RiIoEndianness = 
    require("./../io/endianness");
const RiMdFourCC = 
    require("./../model/fourcc");
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const IRIFFWriteAccessor = 
    RiIoAccessor.IRIFFWriteAccessor;
const RIFFFourCC = 
    RiMdFourCC.RIFFFourCC;
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const RIFFSerializeError = 
    RiError.RIFFSerializeError;
const RIFFDeserializeError = 
    RiError.RIFFDeserializeError;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const ConditionalSynchronizer = 
    XRTLibAsync.Synchronize.Conditional.ConditionalSynchronizer;

//  Imported constants.
const BIG_ENDIAN = 
    RiIoEndianness.BIG_ENDIAN;
const LITTLE_ENDIAN = 
    RiIoEndianness.LITTLE_ENDIAN;

//  Imported functions.
const CopyBetweenAccessors = 
    RiIoAccessor.CopyBetweenAccessors;

//
//  Constants.
//

//  I/O block size.
const IO_BLKSIZE = 4096;

//
//  Classes.
//

/**
 *  RIFF element deserializer output.
 * 
 *  @constructor
 *  @param {IRIFFElement} element
 *    - The element.
 *  @param {Number} offsetNext
 *    - The offset of the next element.
 */
function RIFFElementDeserializerOutput(
    element,
    offsetNext
) {
    //
    //  Public methods.
    //

    /**
     *  Get the element.
     * 
     *  @returns {IRIFFElement}
     *    - The element.
     */
    this.getElement = function() {
        return element;
    };

    /**
     *  Get the offset of the next element.
     * 
     *  @returns {Number}
     *    - The offset.
     */
    this.getNextOffset = function() {
        return offsetNext;
    };
}

/**
 *  RIFF element deserializer options.
 * 
 *  @constructor
 */
function RIFFElementDeserializerOption() {
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
 *  Interface of all RIFF element deserializer classes.
 * 
 *  @constructor
 */
function IRIFFElementDeserializer() {
    //
    //  Public methods.
    //

    /**
     *  Get the element name that can be accepted by the deserializer.
     * 
     *  @returns {RIFFFourCC}
     *    - The element name.
     */
    this.getAcceptableName = function() {
        throw new Error("Not implemented.");
    };

    /**
     *  Deserialize element.
     * 
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFDeserializeError}
     *    - Deserialize error.
     *  @throws {RIFFParameterError}
     *    - One of following error occurred:
     *      - Invalid beginning offset.
     *      - Invalid ending offset.
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @param {IRIFFReadAccessor} accessor
     *    - The deserialization data accessor.
     *  @param {Number} start
     *    - The deserialization beginning offset.
     *  @param {Number} end
     *    - The deserialization ending offset.
     *      - -1 if ending offset is not set.
     *      - Any value larger than the beginning offset if ending offset is 
     *        set.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<RIFFElementDeserializerOutput>}
     *    - The promise object (resolves with the deserialization output if 
     *      succeed, rejects if error occurred).
     */
    this.deserialize = async function(
        accessor,
        start = 0,
        end = -1,
        options = new RIFFElementDeserializerOption(),
        cancellator = new ConditionalSynchronizer()
    ) {
        throw new Error("Not implemented.");
    };
}

/**
 *  RIFF element serializer output.
 * 
 *  @constructor
 *  @param {IRIFFReadAccessor} srDataAccessor
 *    - The serialized data accessor.
 *  @param {Number} srDataLength
 *    - The serialized data length.
 */
function RIFFElementSerializerOutput(
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

    /**
     *  Write serialized data through specified write accessor.
     * 
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFParameterError}
     *    - Invalid offset.
     *  @param {IRIFFWriteAccessor}
     *    - The write accessor.
     *  @param {Number} [offset]
     *    - The write offset.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<void>}
     *    - The promise object (resolves if succeed, rejects if error occurred).
     */
    this.write = async function(
        accessor,
        offset = 0,
        cancellator = new ConditionalSynchronizer()
    ) {
        await CopyBetweenAccessors(
            srDataAccessor, 
            accessor.sub(offset), 
            srDataLength, 
            IO_BLKSIZE, 
            cancellator
        );
    };
}

/**
 *  RIFF element serializer options.
 * 
 *  @constructor
 */
function RIFFElementSerializerOption() {
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
 *  Interface of all RIFF element classes.
 * 
 *  @constructor
 */
function IRIFFElement() {
    //
    //  Public methods.
    //

    /**
     *  Get the element name.
     * 
     *  @returns {RIFFFourCC}
     *    - The element name.
     */
    this.getName = function() {
        throw new Error("Not implemented.");
    };

    /**
     *  Serialize element.
     * 
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFSerializeError}
     *    - Serialize error.
     *  @param {RIFFElementSerializerOption} [options]
     *    - The options.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<RIFFElementSerializerOutput>}
     *    - The promise object (resolves with the serialization output if 
     *      succeed, rejects if error occurred).
     */
    this.serialize = async function(
        options = new RIFFElementSerializerOption(),
        cancellator = new ConditionalSynchronizer()
    ) {
        throw new Error("Not implemented.");
    };
}

//  Export public APIs.
module.exports = {
    "RIFFElementDeserializerOutput": RIFFElementDeserializerOutput,
    "RIFFElementDeserializerOption": RIFFElementDeserializerOption,
    "IRIFFElementDeserializer": IRIFFElementDeserializer,
    "RIFFElementSerializerOutput": RIFFElementSerializerOutput,
    "RIFFElementSerializerOption": RIFFElementSerializerOption,
    "IRIFFElement": IRIFFElement
};