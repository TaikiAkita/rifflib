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
const RiTreeRawElement = 
    require("./raw_element");
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
const RIFFRawElementDeserializer = 
    RiTreeRawElement.RIFFRawElementDeserializer;
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
const ELEMENT_NAME = RIFFFourCC.FromString("RIFF");

//
//  Classes.
//

/**
 *  RIFF form element deserializer.
 * 
 *  @constructor
 *  @extends {IRIFFElementDeserializer}
 *  @param {RIFFFourCC} acptFormType
 *    - The acceptable form type.
 */
function RIFFFormElementDeserializer(acptFormType) {
    //  Let parent class initialize.
    IRIFFElementDeserializer.call(this);

    //
    //  Members.
    //

    /**
     *  Child deserializers.
     * 
     *  @type {Map<Number, Set<IRIFFElementDeserializer>>}
     */
    let cdesmap = new Map();

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
     *  Get the form type that can be accepted by the deserializer.
     * 
     *  @returns {RIFFFourCC}
     *    - The form type.
     */
    this.getAcceptableFormType = function() {
        return acptFormType;
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
     *  Unuse specified child deserializer.
     * 
     *  @throws {RIFFDeserializerNotExistsError}
     *    - Deserializer doesn't exist.
     *  @param {IRIFFElementDeserializer} dsrl
     *    - The child deserializer.
     */
    this.unuseChildDeserializer = function(dsrl) {
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

        //  Get the form type.
        if (ckDataLength < 4) {
            throw new RIFFDeserializeError("Form type truncated.");
        }
        let formType = new RIFFFourCC(
            await ckDataAccessor.read(0, 4, cancellator)
        );
        if (!formType.getBytes().equals(acptFormType.getBytes())) {
            throw new RIFFDeserializeError("Invalid form type.");
        }

        //  Create the form.
        let form = new RIFFFormElement(formType);

        //  Parse form children.
        let childOffset = 4;
        while (childOffset < ckDataLength) {
            //  Select child element deserializer.
            if (childOffset + 8 > ckDataLength) {
                throw new RIFFDeserializeError("Form body truncated.");
            }
            let childChunkIdRaw = await ckDataAccessor.read(
                childOffset, 
                4, 
                cancellator
            );
            let childChunkIdFourCC = new RIFFFourCC(childChunkIdRaw);
            let childDsrlKey = childChunkIdRaw.readUInt32BE(0);
            let childDsrlObjs = [];
            if (cdesmap.has(childDsrlKey)) {
                cdesmap.get(childDsrlKey).forEach(function(childDsrl) {
                    childDsrlObjs.push(childDsrl);
                });
            }
            childDsrlObjs.push(
                new RIFFRawElementDeserializer(childChunkIdFourCC)
            );

            //  Deserialize the form child.
            let childDsrlSuccess = false;
            let childDsrlLastError = null;
            let childDsrlOut = null;
            for (let i = 0; i < childDsrlObjs.length; ++i) {
                let childDsrl = childDsrlObjs[i];
                try {
                    childDsrlOut = await childDsrl.deserialize(
                        ckDataAccessor, 
                        childOffset, 
                        ckDataLength, 
                        options, 
                        cancellator
                    );
                    childDsrlSuccess = true;
                    break;
                } catch(error) {
                    if (error instanceof RIFFDeserializeError) {
                        childDsrlLastError = error;
                    } else {
                        throw error;
                    }
                }
            }
            if (!childDsrlSuccess) {
                throw childDsrlLastError;
            }
            form.addChild(childDsrlOut.getElement());

            //  Move to the next form child.
            childOffset = childDsrlOut.getNextOffset();
        }

        return new RIFFElementDeserializerOutput(
            form,
            ckDesrlOut.getNextOffset()
        );
    };
}

/**
 *  RIFF form element.
 * 
 *  @constructor
 *  @extends {IRIFFElement}
 *  @param {RIFFFourCC}
 *    - The form type.
 */
function RIFFFormElement(formType) {
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
     *  Get the form type.
     * 
     *  @returns {RIFFFourCC}
     *    - The form type.
     */
    this.getFormType = function() {
        return formType;
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
        //  Serialize the form type.
        let srBodyLength = 4;
        let srBodyAccessorFactory = new RIFFMultiSegmentReadAccessorFactory();
        srBodyAccessorFactory.add(
            RIFFMemoryReadAccessor.FromBuffer(formType.getBytes()), 
            4
        );

        //  Serialize form elements.
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
            throw new RIFFSerializeError("Form data is too long.");
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
Util.inherits(RIFFFormElementDeserializer, IRIFFElementDeserializer);
Util.inherits(RIFFFormElement, IRIFFElement);

//  Export public APIs.
module.exports = {
    "RIFFFormElementDeserializer": RIFFFormElementDeserializer,
    "RIFFFormElement": RIFFFormElement
};