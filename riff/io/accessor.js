//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");

//  Imported classes.
const RIFFIOError = 
    RiError.RIFFIOError;
const RIFFParameterError = 
    RiError.RIFFParameterError;
const RIFFOperationCancelledError = 
    RiError.RIFFOperationCancelledError;
const ConditionalSynchronizer = 
    XRTLibAsync.Synchronize.Conditional.ConditionalSynchronizer;

//
//  Classes.
//

/**
 *  Interface of all RIFF read accessors.
 * 
 *  @constructor
 */
function IRIFFReadAccessor() {
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
        throw new Error("Not implemented.");
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
        throw new Error("Not implemented.");
    };
}

/**
 *  Interface of all RIFF write accessors.
 * 
 *  @constructor
 */
function IRIFFWriteAccessor() {
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
        throw new Error("Not implemented.");
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
        throw new Error("Not implemented.");
    };
}

//
//  Public functions.
//

/**
 *  Copy between accessors.
 * 
 *  @throws {RIFFIOError}
 *    - I/O error.
 *  @throws {RIFFParameterError}
 *    - One of following error occurred: 
 *      - Invalid length.
 *      - Invalid block size.
 *  @throws {RIFFOperationCancelledError}
 *      - The cancellator was activated.
 *  @param {IRIFFReadAccessor} src
 *    - The source accessor.
 *  @param {IRIFFWriteAccessor} dst
 *    - The destination accessor.
 *  @param {Number} [blksz]
 *    - The I/O block size.
 *  @returns {Promise<void>}
 *    - The promise object (resolves if succeed, rejects if error occurred).
 */
async function CopyBetweenAccessors(
    src,
    dst,
    length,
    blksz = 4096,
    cancellator = new ConditionalSynchronizer()
) {
    //  Check the length.
    if (!(Number.isInteger(length) && length >= 0)) {
        throw new RIFFParameterError("Invalid length.");
    }

    //  Check the block size.
    if (!(Number.isInteger(blksz) && blksz >= 0)) {
        throw new RIFFParameterError("Invalid block size.");
    }

    //  Fast path for zero-length.
    if (length == 0) {
        return;
    }

    //  Copy blocks.
    let offset = 0;
    while (length != 0) {
        let rdwrLen = length;
        if (rdwrLen > blksz) {
            rdwrLen = blksz;
        }
        let rdwrBuf = await src.read(offset, rdwrLen, cancellator);
        await dst.write(offset, rdwrBuf, cancellator);
        offset += rdwrLen;
        length -= rdwrLen;
    }
}

//  Export public APIs.
module.exports = {
    "IRIFFReadAccessor": IRIFFReadAccessor,
    "IRIFFWriteAccessor": IRIFFWriteAccessor,
    "CopyBetweenAccessors": CopyBetweenAccessors
};