//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const RiTreeElement = 
    require("./element");
const RiIoAccessor = 
    require("./../io/accessor");
const RiIoMemAccessor = 
    require("./../io/mem_accessor");
const RiMdFourCC = 
    require("./../model/fourcc");
const RiMdChunk = 
    require("./../model/chunk");
const RiMdChunkDeserializer = 
    require("./../model/chunk_deserializer");
const RiMdChunkSerializer = 
    require("./../model/chunk_serializer");
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");
const Util = 
    require("util");

//  Imported classes.
const RIFFMemoryReadAccessor = 
    RiIoMemAccessor.RIFFMemoryReadAccessor;
const RIFFElementDeserializerOutput = 
    RiTreeElement.RIFFElementDeserializerOutput;
const RIFFElementDeserializerOption = 
    RiTreeElement.RIFFElementDeserializerOption;
const IRIFFElementDeserializer = 
    RiTreeElement.IRIFFElementDeserializer;
const RIFFElementSerializerOption = 
    RiTreeElement.RIFFElementSerializerOption;
const IRIFFElement = 
    RiTreeElement.IRIFFElement;
const RIFFChunk = 
    RiMdChunk.RIFFChunk;
const RIFFChunkDeserializer = 
    RiMdChunkDeserializer.RIFFChunkDeserializer;
const RIFFChunkDeserializerOption = 
    RiMdChunkDeserializer.RIFFChunkDeserializerOption;
const RIFFChunkSerializer = 
    RiMdChunkSerializer.RIFFChunkSerializer;
const RIFFChunkSerializerOption = 
    RiMdChunkSerializer.RIFFChunkSerializerOption;
const RIFFElementSerializerOutput = 
    RiTreeElement.RIFFElementSerializerOutput;
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

//
//  Constants.
//

//  Empty data accessor.
const EMPTY_DATAACCESSOR = RIFFMemoryReadAccessor.FromBuffer(
    Buffer.allocUnsafe(0)
);

//
//  Classes.
//

/**
 *  RIFF raw element deserializer.
 * 
 *  @constructor
 *  @extends {IRIFFElementDeserializer}
 *  @param {RIFFFourCC} acptName
 *    - The acceptable element name.
 */
function RIFFRawElementDeserializer(acptName) {
    //  Let parent class initialize.
    IRIFFElementDeserializer.call(this);

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
        return acptName;
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
        //  Get the chunk.
        let ckDesrlOpt = new RIFFChunkDeserializerOption();
        ckDesrlOpt.setEndianness(options.getEndianness());
        ckDesrlOpt.setWordAligned(options.isWordAligned());
        let ckDesrl = new RIFFChunkDeserializer(ckDesrlOpt);
        let ckDesrlOut = await ckDesrl.deserialize(
            accessor, 
            start, 
            end, 
            cancellator
        );
        let ck = ckDesrlOut.getChunk();
        
        //  Check the chunk ID.
        if (!ck.getChunkID().getBytes().equals(acptName.getBytes())) {
            throw new RIFFDeserializeError("Invalid element name (chunk ID).");
        }
        
        //  Build the element.
        let elem = new RIFFRawElement(acptName);
        elem.setDataAccessor(ck.getChunkDataAccessor());
        elem.setDataLength(ck.getChunkDataLength());

        return new RIFFElementDeserializerOutput(
            elem,
            ckDesrlOut.getNextOffset()
        );
    };
}

/**
 *  RIFF raw element.
 * 
 *  @constructor
 *  @extends {IRIFFElement}
 *  @param {RIFFFourCC} name
 *    - The element name.
 */
function RIFFRawElement(name) {
    //  Let parent class initialize.
    IRIFFElement.call(this);

    //
    //  Members.
    //

    //  Data.
    let dataAccessor = EMPTY_DATAACCESSOR;
    let dataLength = 0;

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
        return name;
    };

    /**
     *  Get the data accessor.
     * 
     *  @returns {IRIFFReadAccessor}
     *    - The data accessor.
     */
    this.getDataAccessor = function() {
        return dataAccessor;
    };

    /**
     *  Set the data accessor.
     * 
     *  @param {IRIFFReadAccessor} da
     *    - The data accessor.
     */
    this.setDataAccessor = function(da) {
        dataAccessor = da;
    };

    /**
     *  Get the data length.
     * 
     *  @returns {Number}
     *    - The data length.
     */
    this.getDataLength = function() {
        return dataLength;
    };

    /**
     *  Set the data length.
     * 
     *  Note(s):
     *    [1] The data length must be a non-negative integer.
     *    [2] The data length must be lower than or equal to 0xFFFFFFFF.
     * 
     *  @throws {RIFFParameterError}
     *    - Invalid data length.
     *  @param {Number} dlen
     *    - The data length.
     */
    this.setDataLength = function(dlen) {
        if (!(Number.isInteger(dlen) && dlen >= 0 && dlen <= 0xFFFFFFFF)) {
            throw new RIFFParameterError("Invalid data length.");
        }
        dataLength = dlen;
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
        let ckSrlOpt = new RIFFChunkSerializerOption();
        ckSrlOpt.setEndianness(options.getEndianness());
        ckSrlOpt.setWordAligned(options.isWordAligned());
        let ckSrl = new RIFFChunkSerializer(ckSrlOpt);
        let ck = new RIFFChunk(name, dataAccessor, dataLength);
        let ckSrlOut = await ckSrl.serialize(ck, cancellator);
        return new RIFFElementSerializerOutput(
            ckSrlOut.getDataAccessor(), 
            ckSrlOut.getDataLength()
        );
    };
}

//
//  Inheritances.
//
Util.inherits(RIFFRawElementDeserializer, IRIFFElementDeserializer);
Util.inherits(RIFFRawElement, IRIFFElement);

//  Export public APIs.
module.exports = {
    "RIFFRawElementDeserializer": RIFFRawElementDeserializer,
    "RIFFRawElement": RIFFRawElement
};