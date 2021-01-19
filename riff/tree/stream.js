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
const RITreeRawElement = 
    require("./raw_element");
const RiIoAccessor = 
    require("./../io/accessor");
const RiIoMsegAccessor = 
    require("./../io/mseg_accessor");
const RiMdFourCC = 
    require("./../model/fourcc");
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");

//  Imported classes.
const RIFFFourCC = 
    RiMdFourCC.RIFFFourCC;
const IRIFFElement = 
    RiTreeElement.IRIFFElement;
const RIFFElementSerializerOption = 
    RiTreeElement.RIFFElementSerializerOption;
const RIFFElementDeserializerOption = 
    RiTreeElement.RIFFElementDeserializerOption;
const IRIFFElementDeserializer = 
    RiTreeElement.IRIFFElementDeserializer;
const RIFFRawElementDeserializer = 
    RITreeRawElement.RIFFRawElementDeserializer;
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const RIFFMultiSegmentReadAccessorFactory = 
    RiIoMsegAccessor.RIFFMultiSegmentReadAccessorFactory;
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const RIFFSerializeError = 
    RiError.RIFFSerializeError;
const RIFFDeserializeError = 
    RiError.RIFFDeserializeError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const RIFFDeserializerExistedError = 
    RiError.RIFFDeserializerExistedError;
const RIFFDeserializerNotExistsError = 
    RiError.RIFFDeserializerNotExistsError;
const ConditionalSynchronizer = 
    XRTLibAsync.Synchronize.Conditional.ConditionalSynchronizer;

//
//  Classes.
//

/**
 *  RIFF element deserialization stream.
 * 
 *  @constructor
 *  @throws {RIFFParameterError}
 *    - Invalid ending offset.
 *  @param {IRIFFReadAccessor} accessor
 *    - The accessor.
 *  @param {Number} [ending]
 *    - The ending offset.
 *      - -1 if the ending offset is not set.
 *      - Any non-negative integer if the ending offset is set.
 *  @param {RIFFElementDeserializerOption} [dsrlopt]
 *    - The deserialization option.
 */
function RIFFElementDeserializationStream(
    accessor, 
    ending = -1, 
    dsrlopt = new RIFFElementDeserializerOption()
) {
    //
    //  Parameter check.
    //

    //  Check the ending offset.
    if (ending == -1) {
        ending = Infinity;
    } else {
        if (!(Number.isInteger(ending) && ending >= 0)) {
            throw new RIFFParameterError("Invalid ending offset.");
        }
    }

    //
    //  Members.
    //

    /**
     *  Deserializers.
     * 
     *  @type {Map<Number, Set<IRIFFElementDeserializer>>}
     */
    let cdesmap = new Map();

    //  Current offset.
    let offsetCurrent = 0;

    //
    //  Private methods.
    //

    /**
     *  Get deserialization chain.
     * 
     *  @param {RIFFFourCC} name 
     *    - The element name.
     *  @returns {IRIFFElementDeserializer[]}
     *    - The element deserialization chain.
     */
    function _GetDeserializerChain(name) {
        let chain = [];
        let dsrlkey = name.getBytes().readUInt32BE(0);
        if (cdesmap.has(dsrlkey)) {
            cdesmap.get(dsrlkey).forEach(function(dsrl) {
                chain.push(dsrl);
            });
        }
        chain.push(new RIFFRawElementDeserializer(name));
        return chain;
    }

    //
    //  Public methods.
    //

    /**
     *  Use specified deserializer.
     * 
     *  @throws {RIFFDeserializerExistedError}
     *    - Deserializer existed.
     *  @param {IRIFFElementDeserializer} dsrl
     *    - The deserializer.
     */
    this.useDeserializer = function(dsrl) {
        let dsrlkey = dsrl.getAcceptableName().getBytes().readUInt32BE(0);
        let dsrlobjs = null;
        if (cdesmap.has(dsrlkey)) {
            dsrlobjs = cdesmap.get(dsrlkey);
            if (dsrlobjs.has(dsrl)) {
                throw new RIFFDeserializerExistedError(
                    "Deserializer existed."
                );
            }
        } else {
            dsrlobjs = new Set();
            cdesmap.set(dsrlkey, dsrlobjs);
        }
        dsrlobjs.add(dsrl);
    };

    /**
     *  Unuse specified deserializer.
     * 
     *  @throws {RIFFDeserializerNotExistsError}
     *    - Deserializer doesn't exist.
     *  @param {IRIFFElementDeserializer} dsrl
     *    - The deserializer.
     */
    this.unuseDeserializer = function(dsrl) {
        let dsrlkey = dsrl.getAcceptableName().getBytes().readUInt32BE(0);
        if (!cdesmap.has(dsrlkey)) {
            throw new RIFFDeserializerNotExistsError(
                "Deserializer doesn't exist."
            );
        }
        let dsrlobjs = cdesmap.get(dsrlkey);
        if (!dsrlobjs.delete(dsrl)) {
            throw new RIFFDeserializerNotExistsError(
                "Deserializer doesn't exist."
            );
        }
        if (dsrlobjs.size == 0) {
            cdesmap.delete(dsrlkey);
        }
    };

    /**
     *  Get whether there exists the next element.
     * 
     *  @returns {Boolean}
     *    - True if so.
     */
    this.hasNext = function() {
        return offsetCurrent < ending;
    };

    /**
     *  Deserialize next element.
     * 
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFDeserializeError}
     *    - Deserialize error.
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<IRIFFElement>}
     *    - The promise object (resolves with the element if succeed, rejects if
     *      error occurred).
     */
    this.next = async function(
        cancellator = new ConditionalSynchronizer()
    ) {
        //  Get the next element name.
        if (offsetCurrent + 4 > ending) {
            throw new RIFFDeserializeError("Chunk truncated.");
        }
        let elementName = await accessor.read(offsetCurrent, 4, cancellator);

        //  Get the deserializer chain.
        let dsrlObjects = _GetDeserializerChain(new RIFFFourCC(elementName));

        //  Deserialize.
        let dsrlSuccess = false;
        let dsrlLastError = null;
        let dsrlOutput = null;
        for (let i = 0; i < dsrlObjects.length; ++i) {
            try {
                dsrlOutput = await dsrlObjects[i].deserialize(
                    accessor, 
                    offsetCurrent, 
                    ending, 
                    dsrlopt, 
                    cancellator
                );
                dsrlSuccess = true;
                break;
            } catch(error) {
                if (error instanceof RIFFDeserializeError) {
                    dsrlLastError = error;
                } else {
                    throw error;
                }
            }
        }
        if (!dsrlSuccess) {
            throw dsrlLastError;
        }

        //  Move to the next chunk.
        offsetCurrent = dsrlOutput.getNextOffset();

        return dsrlOutput.getElement();
    };
}

/**
 *  RIFF element serialization stream accessor.
 * 
 *  @constructor
 *  @param {IRIFFReadAccessor} dataAccessor
 *    - The data accessor.
 *  @param {Number} dataLength
 *    - The data length.
 */
function RIFFElementSerializationStreamAccessor(
    dataAccessor,
    dataLength
) {
    //
    //  Public methods.
    //

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
     *  Get the data length.
     * 
     *  @returns {Number}
     *    - The data length.
     */
    this.getDataLength = function() {
        return dataLength;
    };
}

/**
 *  RIFF element serialization stream.
 * 
 *  @constructor
 *  @param {RIFFElementSerializerOption} srlopt
 *    - The serialization option.
 */
function RIFFElementSerializationStream(
    srlopt = new RIFFElementSerializerOption()
) {
    //
    //  Members.
    //

    //  Accessor factory.
    let accessorFactory = new RIFFMultiSegmentReadAccessorFactory();

    //  Accessor byte count.
    let accessorByteCnt = 0;

    //
    //  Public methods.
    //

    /**
     *  Serialize element.
     * 
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFSerializeError}
     *    - Serialize error.
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @param {IRIFFElement} element
     *    - The element.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<void>}
     *    - The promise object (resolves if succeed, rejects if error occurred).
     */
    this.serialize = async function(
        element,
        cancellator = new ConditionalSynchronizer()
    ) {
        //  Serialize element.
        let serialized = await element.serialize(srlopt, cancellator);
        let srlDataLength = serialized.getDataLength();
        let srlDataAccessor = serialized.getDataAccessor();

        //  Append the serialized element to stream.
        accessorFactory.add(srlDataAccessor, srlDataLength);

        //  Increase the serialized byte count.
        accessorByteCnt += srlDataLength;
    };

    /**
     *  Create the accessor.
     * 
     *  @param {OutputParameter<Number>}
     *    - The ending position of the returned read accessor.
     *  @returns {IRIFFReadAccessor}
     *    - The accessor.
     */
    this.createAccessor = function() {
        return new RIFFElementSerializationStreamAccessor(
            accessorFactory.create(),
            accessorByteCnt
        );
    };
}

//  Export public APIs.
module.exports = {
    "RIFFElementDeserializationStream": 
        RIFFElementDeserializationStream,
    "RIFFElementSerializationStreamAccessor": 
        RIFFElementSerializationStreamAccessor,
    "RIFFElementSerializationStream": 
        RIFFElementSerializationStream
};