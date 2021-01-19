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
//  Classes.
//

/**
 *  RIFF NULL-terminated string (ZSTR) element deserializer.
 * 
 *  @constructor
 *  @extends {IRIFFElementDeserializer}
 *  @param {RIFFFourCC} name
 *    - The acceptable element name.
 */
function RIFFZStringElementDeserializer(name) {
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
        return name;
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
        if (!ck.getChunkID().getBytes().equals(name.getBytes())) {
            throw new RIFFDeserializeError("Invalid element name (chunk ID).");
        }
        
        //  Read string bytes.
        let stringBytes = await ck.getChunkDataAccessor().read(
            0, 
            ck.getChunkDataLength(), 
            cancellator
        );

        //  Build the element.
        let elem = new RIFFZStringElement(name);
        elem.setStringBytes(stringBytes);

        return new RIFFElementDeserializerOutput(
            elem,
            ckDesrlOut.getNextOffset()
        );
    };
}

/**
 *  RIFF NULL-terminated string (ZSTR) element.
 * 
 *  @constructor
 *  @extends {IRIFFElement}
 *  @param {RIFFFourCC} name
 *    - The element name.
 */
function RIFFZStringElement(name) {
    //  Let parent class initialize.
    IRIFFElement.call(this);

    //
    //  Members.
    //

    //  String bytes.
    let stringBytes = Buffer.from([0]);

    //
    //  Public methods.
    //

    /**
     *  Get the string bytes.
     * 
     *  @returns {Buffer}
     *    - The string bytes.
     */
    this.getStringBytes = function() {
        return stringBytes;
    };

    /**
     *  Set the string bytes.
     * 
     *  Note(s):
     *    [1] The length of the string bytes (excluding the NULL terminator) 
     *        must be lower than 0xFFFFFFFF.
     * 
     *  @throws {RIFFParameterError}
     *    - The string bytes are too long.
     *  @param {Buffer} sb
     *    - The string bytes.
     */
    this.setStringBytes = function(sb) {
        for (let i = 0; i < sb.length; ++i) {
            if (sb.readUInt8(i) == 0) {
                sb = sb.slice(0, i);
                break;
            }
        }
        if (sb.length >= 0xFFFFFFFF) {
            throw new RIFFParameterError(
                "The string bytes are too long."
            );
        }
        stringBytes = sb;
    };

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
        let ckData = Buffer.allocUnsafe(1 + stringBytes.length);
        stringBytes.copy(ckData);
        ckData.writeUInt8(0, stringBytes.length);
        let ckSrlOpt = new RIFFChunkSerializerOption();
        ckSrlOpt.setEndianness(options.getEndianness());
        ckSrlOpt.setWordAligned(options.isWordAligned());
        let ckSrl = new RIFFChunkSerializer(ckSrlOpt);
        let ck = new RIFFChunk(
            name, 
            RIFFMemoryReadAccessor.FromBuffer(ckData), 
            ckData.length
        );
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
Util.inherits(RIFFZStringElementDeserializer, IRIFFElementDeserializer);
Util.inherits(RIFFZStringElement, IRIFFElement);

//  Export public APIs.
module.exports = {
    "RIFFZStringElementDeserializer": RIFFZStringElementDeserializer,
    "RIFFZStringElement": RIFFZStringElement
};