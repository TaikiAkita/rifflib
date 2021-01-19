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
    require("./accessor");
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");
const Util = 
    require("util");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const IRIFFWriteAccessor = 
    RiIoAccessor.IRIFFWriteAccessor;
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const RIFFInvalidOperationError = 
    RiError.RIFFInvalidOperationError;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const ConditionalSynchronizer = 
    XRTLibAsync.Synchronize.Conditional.ConditionalSynchronizer;
const EventFlags = 
    XRTLibAsync.Synchronize.Event.EventFlags;

//
//  Constants.
//

//  Write accessor flags.
const WRBITMASK_ENDED = 0x01;

//
//  Classes.
//

/**
 *  RIFF memory read accessor.
 * 
 *  @constructor
 *  @extends {IRIFFReadAccessor}
 *  @param {Buffer} bytes
 *    - The memory bytes.
 *  @param {Number} byteOffset
 *    - The offset of the memory bytes.
 */
function RIFFMemoryReadAccessor(
    bytes,
    byteOffset
) {
    //  Let parent class initialize.
    IRIFFReadAccessor.call(this);

    //
    //  Public methods.
    //

    /**
     *  Read data asynchronously.
     * 
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @throws {RIFFParameterError}
     *    - One of following errors occurred:
     *      - Invalid data address.
     *      - Invalid data length.
     *  @param {Number} address
     *    - The data address.
     *  @param {Number} length
     *    - The data length.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<Buffer>}
     *    - The promise object (resolves with the data if succeed, rejects if 
     *      error occurred).
     */
    this.read = async function(
        address, 
        length, 
        cancellator = new ConditionalSynchronizer()
    ) {
        //  Check the data address.
        if (!(Number.isInteger(address) && address >= 0)) {
            throw new RIFFParameterError("Invalid data address.");
        }

        //  Check the data length.
        if (!(Number.isInteger(length) && length >= 0)) {
            throw new RIFFParameterError("Invalid data length.");
        }

        //  Fast path for zero-length read operation.
        if (length == 0) {
            return Buffer.allocUnsafe(0);
        }

        //  Read data.
        let offsetBegin = byteOffset + address;
        let offsetEnd = offsetBegin + length;
        if (offsetEnd > bytes.length) {
            throw new RIFFIOError("Address overflow.");
        }
        return Buffer.from(bytes.slice(offsetBegin, offsetEnd));
    };

    /**
     *  Get sub accessor.
     * 
     *  @throws {RIFFParameterError}
     *    - Invalid offset.
     *  @param {Number} offset
     *    - The address offset.
     *  @returns {IRIFFReadAccessor}
     *    - The sub accessor.
     */
    this.sub = function(offset) {
        if (!(Number.isInteger(offset) && offset >= 0)) {
            throw new RIFFParameterError("Invalid offset.");
        }
        return new RIFFMemoryReadAccessor(bytes, byteOffset + offset);
    };
}

/**
 *  Create a new memory read accessor.
 * 
 *  @param {Buffer} buf
 *    - The memory buffer.
 *  @returns {RIFFMemoryReadAccessor}
 *    - The memory read accessor.
 */
RIFFMemoryReadAccessor.FromBuffer = function(buf) {
    return new RIFFMemoryReadAccessor(buf, 0);
};

/**
 *  RIFF memory write accessor.
 * 
 *  @constructor
 *  @extends {IRIFFWriteAccessor}
 *  @param {Number[]} byteArray
 *    - The byte array.
 *  @param {Number} byteArrayOffset
 *    - The base offset of the byte array.
 *  @param {EventFlags} flags
 *    - The flags.
 *  @param {Boolean} toplevel
 *    - True if the accessor is the top-level accessor.
 */
function RIFFMemoryWriteAccessor(
    byteArray, 
    byteArrayOffset,
    flags,
    toplevel
) {
    //  Let parent class initialize.
    IRIFFWriteAccessor.call(this);

    //
    //  Public methods.
    //

    /**
     *  Write data asynchronously.
     * 
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @throws {RIFFParameterError}
     *    - Invalid data address.
     *  @param {Number} address
     *    - The data address.
     *  @param {Buffer} data
     *    - The data.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<void>}
     *    - The promise object (resolves if succeed, rejects if error occurred).
     */
    this.write = async function(
        address,
        data,
        cancellator = new ConditionalSynchronizer()
    ) {
        //  Check the data address.
        if (!(Number.isInteger(address) && address >= 0)) {
            throw new RIFFParameterError("Invalid data address.");
        }

        //  Ensure not ended.
        if ((flags.value & WRBITMASK_ENDED) != 0) {
            throw new RIFFIOError(
                "The accessor was already ended."
            );
        }

        //  Ensure enough space.
        let offsetEnd = byteArrayOffset + address + data.length;
        while (byteArray.length < offsetEnd) {
            byteArray.push(0x00);
        }

        //  Copy data.
        for (
            let ptrsrc = 0, ptrdst = byteArrayOffset + address; 
            ptrsrc < data.length; 
            ++ptrsrc, ++ptrdst
        ) {
            byteArray[ptrdst] = data.readUInt8(ptrsrc);
        }
    };

    /**
     *  Get sub accessor.
     * 
     *  @throws {RIFFParameterError}
     *    - Invalid offset.
     *  @param {Number} offset
     *    - The address offset.
     *  @returns {IRIFFWriteAccessor}
     *    - The sub accessor.
     */
    this.sub = function(offset) {
        if (!(Number.isInteger(offset) && offset >= 0)) {
            throw new RIFFParameterError("Invalid offset.");
        }
        return new RIFFMemoryWriteAccessor(
            byteArray, 
            byteArrayOffset + offset, 
            flags,
            false
        );
    };

    /**
     *  End the accessor.
     * 
     *  Note(s):
     *    [1] All sub accessors would also be ended.
     *    [2] This method is only available to the top-level accessor.
     * 
     *  @throws {RIFFInvalidOperationError}
     *    - One of following error occurred:
     *      - The accessor was already ended.
     *      - Not top-level accessor.
     *  @returns {Buffer}
     *    - The memory bytes.
     */
    this.end = function() {
        //  Ensure top-level accessor.
        if (!toplevel) {
            throw new RIFFInvalidOperationError(
                "Not top-level accessor."
            );
        }

        //  Ensure not ended.
        if ((flags.value & WRBITMASK_ENDED) != 0) {
            throw new RIFFInvalidOperationError(
                "The accessor was already ended."
            );
        }

        //  Mark the ended flag.
        flags.post(WRBITMASK_ENDED, EventFlags.POST_FLAG_SET);

        return Buffer.from(byteArray);
    };
}

/**
 *  Create a new (top-level) memory write accessor.
 * 
 *  @returns {RIFFMemoryWriteAccessor}
 *    - The memory write accessor.
 */
RIFFMemoryWriteAccessor.New = function() {
    return new RIFFMemoryWriteAccessor(
        [],
        0,
        new EventFlags(0x00),
        true
    );
};

//
//  Inheritances.
//
Util.inherits(RIFFMemoryReadAccessor, IRIFFReadAccessor);
Util.inherits(RIFFMemoryWriteAccessor, IRIFFWriteAccessor);

//  Export public APIs.
module.exports = {
    "RIFFMemoryReadAccessor": RIFFMemoryReadAccessor,
    "RIFFMemoryWriteAccessor": RIFFMemoryWriteAccessor
};