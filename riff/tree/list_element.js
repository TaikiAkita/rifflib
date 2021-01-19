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
const RiTreeStream = 
    require("./stream");
const RiIoAccessor = 
    require("./../io/accessor");
const RiIoMemAccessor = 
    require("./../io/mem_accessor");
const RiIoMsegAccessor = 
    require("./../io/mseg_accessor");
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
const RIFFMultiSegmentReadAccessorFactory = 
    RiIoMsegAccessor.RIFFMultiSegmentReadAccessorFactory;
const RIFFElementDeserializerOutput = 
    RiTreeElement.RIFFElementDeserializerOutput;
const RIFFElementDeserializerOption = 
    RiTreeElement.RIFFElementDeserializerOption;
const IRIFFElementDeserializer = 
    RiTreeElement.IRIFFElementDeserializer;
const RIFFElementSerializerOutput = 
    RiTreeElement.RIFFElementSerializerOutput
const RIFFElementSerializerOption = 
    RiTreeElement.RIFFElementSerializerOption;
const IRIFFElement = 
    RiTreeElement.IRIFFElement;
const RIFFElementDeserializationStream = 
    RiTreeStream.RIFFElementDeserializationStream;
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
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const RIFFFourCC = 
    RiMdFourCC.RIFFFourCC;
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFDeserializerNotExistsError = 
    RiError.RIFFDeserializerNotExistsError;
const RIFFDeserializerExistedError = 
    RiError.RIFFDeserializerExistedError;
const RIFFInvalidIndexError = 
    RiError.RIFFInvalidIndexError;
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

//  Element name.
const ELEMENT_NAME = RIFFFourCC.FromString("LIST");

//
//  Classes.
//

/**
 *  RIFF list element deserializer.
 * 
 *  @constructor
 *  @extends {IRIFFElementDeserializer}
 *  @param {RIFFFourCC} acptListType
 *    - The acceptable list type.
 */
function RIFFListElementDeserializer(acptListType) {
    //  Let parent class initialize.
    IRIFFElementDeserializer.call(this);

    //
    //  Members.
    //

    /**
     *  Deserializers.
     * 
     *  @type {Set<IRIFFElementDeserializer>}
     */
    let dsrls = new Set();

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
        return ELEMENT_NAME;
    };

    /**
     *  Get the list type that can be accepted by the deserializer.
     * 
     *  @returns {RIFFFourCC}
     *    - The list type.
     */
    this.getAcceptableListType = function() {
        return acptListType;
    };

    /**
     *  Use specified child deserializer.
     * 
     *  @throws {RIFFDeserializerExistedError}
     *    - Deserializer existed.
     *  @param {IRIFFElementDeserializer} dsrl
     *    - The child deserializer.
     */
    this.useChildDeserializer = function(dsrl) {
        if (dsrls.has(dsrl)) {
            throw new RIFFDeserializerExistedError(
                "Deserializer existed."
            );
        }
        dsrls.add(dsrl);
    };

    /**
     *  Unuse specified child deserializer.
     * 
     *  @throws {RIFFDeserializerNotExistsError}
     *    - Deserializer doesn't exist.
     *  @param {IRIFFElementDeserializer} dsrl
     *    - The child deserializer.
     */
    this.unuseChildDeserializer = function(dsrl) {
        if (!dsrls.delete(dsrl)) {
            throw new RIFFDeserializerNotExistsError(
                "Deserializer doesn't exist."
            );
        }
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
        let ckDataAccessor = ck.getChunkDataAccessor();
        let ckDataLength = ck.getChunkDataLength();

        //  Check the chunk ID.
        if (!ck.getChunkID().getBytes().equals(ELEMENT_NAME.getBytes())) {
            throw new RIFFDeserializeError("Invalid element name (chunk ID).");
        }

        //  Get the list type.
        if (ckDataLength < 4) {
            throw new RIFFDeserializeError("List type truncated.");
        }
        let listType = new RIFFFourCC(
            await ckDataAccessor.read(0, 4, cancellator)
        );
        if (!listType.getBytes().equals(acptListType.getBytes())) {
            throw new RIFFDeserializeError("Invalid list type.");
        }

        //  Create the list.
        let list = new RIFFListElement(listType);

        //  Parse list children.
        let listChildrenStream = new RIFFElementDeserializationStream(
            ckDataAccessor.sub(4),
            ckDataLength - 4,
            options
        );
        dsrls.forEach(function(dsrl) {
            listChildrenStream.useDeserializer(dsrl);
        });
        while (listChildrenStream.hasNext()) {
            let listChild = await listChildrenStream.next(cancellator);
            list.addChild(listChild);
        }

        return new RIFFElementDeserializerOutput(
            list,
            ckDesrlOut.getNextOffset()
        );
    };
}

/**
 *  RIFF list element.
 * 
 *  @constructor
 *  @extends {IRIFFElement}
 *  @param {RIFFFourCC}
 *    - The list type.
 */
function RIFFListElement(listType) {
    //  Let parent class initialize.
    IRIFFElement.call(this);

    //
    //  Members.
    //

    /**
     *  Child elements.
     * 
     *  @type {IRIFFElement[]}
     */
    let children = [];

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
        return ELEMENT_NAME;
    };

    /**
     *  Get the list type.
     * 
     *  @returns {RIFFFourCC}
     *    - The list type.
     */
    this.getListType = function() {
        return listType;
    };

    /**
     *  Add a child element to the tail of the children list.
     * 
     *  @param {IRIFFElement}
     *    - The child element.
     */
    this.addChild = function(elem) {
        children.push(elem);
    };

    /**
     *  Insert a child element to specified index of the children list.
     * 
     *  @throws {RIFFInvalidIndexError}
     *    - Invalid index.
     *  @param {Number} index
     *    - The insertion index.
     *  @param {IRIFFElement} elem
     *    - The child element.
     */
    this.insertChild = function(index, elem) {
        //  Check the index.
        if (!(
            Number.isInteger(index) && 
            index >= 0 && 
            index <= children.length
        )) {
            throw new RIFFInvalidIndexError("Invalid index.");
        }

        //  Insert the element.
        children.splice(index, 0, elem);
    };

    /**
     *  Remove a child element at specified index of the children list.
     * 
     *  @throws {RIFFInvalidIndexError}
     *    - Invalid index.
     *  @param {Number} index
     *    - The index.
     */
    this.removeChild = function(index) {
        //  Check the index.
        if (!(
            Number.isInteger(index) && 
            index >= 0 && 
            index < children.length
        )) {
            throw new RIFFInvalidIndexError("Invalid index.");
        }

        //  Remove the element.
        children.splice(index, 1);
    };

    /**
     *  Remove all children elements.
     */
    this.removeAllChildren = function() {
        children.splice(0, children.length);
    };

    /**
     *  Get the child element at specified index.
     * 
     *  @throws {RIFFInvalidIndexError}
     *    - Invalid index.
     *  @param {Number} index
     *    - The index.
     */
    this.getChildAt = function(index) {
        //  Check the index.
        if (!(
            Number.isInteger(index) && 
            index >= 0 && 
            index < children.length
        )) {
            throw new RIFFInvalidIndexError("Invalid index.");
        }

        //  Get the child.
        return children[index];
    };

    /**
     *  Set the child element at specified index.
     * 
     *  @throws {RIFFInvalidIndexError}
     *    - Invalid index.
     *  @param {Number} index
     *    - The index.
     *  @param {IRIFFElement} elem
     *    - The new children element.
     *  @returns {IRIFFElement}
     *    - The old children element.
     */
    this.setChildAt = function(index, elem) {
        //  Check the index.
        if (!(
            Number.isInteger(index) && 
            index >= 0 && 
            index < children.length
        )) {
            throw new RIFFInvalidIndexError("Invalid index.");
        }

        //  Get the old element.
        let old = children[index];

        //  Set the element.
        children[index] = elem;

        return old;
    };

    /**
     *  Get the count of children elements.
     * 
     *  @returns {Number}
     *    - The count.
     */
    this.getChildrenCount = function() {
        return children.length;
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
        //  Serialize the list type.
        let srBodyLength = 4;
        let srBodyAccessorFactory = new RIFFMultiSegmentReadAccessorFactory();
        srBodyAccessorFactory.add(
            RIFFMemoryReadAccessor.FromBuffer(listType.getBytes()), 
            4
        );

        //  Serialize list elements.
        for (let i = 0; i < children.length; ++i) {
            let childSrOut = await children[i].serialize(options, cancellator);
            let childSrLen = childSrOut.getDataLength();
            srBodyAccessorFactory.add(
                childSrOut.getDataAccessor(), 
                childSrLen
            );
            srBodyLength += childSrLen;
        }
        if (srBodyLength > 0xFFFFFFFF) {
            throw new RIFFSerializeError("List data is too long.");
        }

        //  Serialize the chunk.
        let ckSrlOpt = new RIFFChunkSerializerOption();
        ckSrlOpt.setEndianness(options.getEndianness());
        ckSrlOpt.setWordAligned(options.isWordAligned());
        let ckSrl = new RIFFChunkSerializer(ckSrlOpt);
        let ck = new RIFFChunk(
            ELEMENT_NAME, 
            srBodyAccessorFactory.create(), 
            srBodyLength
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
Util.inherits(RIFFListElementDeserializer, IRIFFElementDeserializer);
Util.inherits(RIFFListElement, IRIFFElement);

//  Export public APIs.
module.exports = {
    "RIFFListElementDeserializer": RIFFListElementDeserializer,
    "RIFFListElement": RIFFListElement
};