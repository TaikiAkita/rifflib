//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const RiMdFourCC = 
    require("./fourcc");
const RiIoAccessor = 
    require("./../io/accessor");
const RiError = 
    require("./../../error");
const XRTLibAsync = 
    require("xrtlibrary-async");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
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
//  Classes.
//

/**
 *  RIFF chunk.
 * 
 *  Note(s):
 *    [1] The chunk data length must be a non-negative integer.
 *    [2] The chunk data length must be lower than or equal to 0xFFFFFFFF.
 * 
 *  @constructor
 *  @throws {RIFFParameterError}
 *    - Invalid chunk data length.
 *  @param {RIFFFourCC} ckID
 *    - The chunk ID.
 *  @param {IRIFFReadAccessor} ckDataAccessor
 *    - The chunk data accessor.
 *  @param {Number} ckDataLength
 *    - The chunk data length.
 */
function RIFFChunk(
    ckID,
    ckDataAccessor,
    ckDataLength
) {
    //
    //  Parameter check.
    //

    //  Check the data length.
    if (!(
        Number.isInteger(ckDataLength) && 
        ckDataLength >= 0 && 
        ckDataLength <= 0xFFFFFFFF
    )) {
        throw new RIFFParameterError(
            "Invalid chunk data length."
        );
    }

    //
    //  Public methods.
    //

    /**
     *  Get the chunk ID.
     * 
     *  @returns {RIFFFourCC}
     *    - The chunk ID.
     */
    this.getChunkID = function() {
        return ckID;
    };

    /**
     *  Get the chunk data.
     * 
     *  @throws {RIFFOperationCancelledError}
     *    - The cancellator was activated.
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @param {ConditionalSynchronizer} [cancellator]
     *    - The cancellator.
     *  @returns {Promise<Buffer>}
     *    - The promise object (resolves with the chunk data if succeed, rejects
     *      if error occurred).
     */
    this.getChunkData = async function(
        cancellator = new ConditionalSynchronizer()
    ) {
        return await ckDataAccessor.read(0, ckDataLength);
    };

    /**
     *  Get the chunk data accessor.
     * 
     *  @returns {IRIFFReadAccessor}
     *    - The chunk data accessor.
     */
    this.getChunkDataAccessor = function() {
        return ckDataAccessor;
    };

    /**
     *  Get the chunk data length.
     * 
     *  @returns {Number}
     *    - The chunk data length.
     */
    this.getChunkDataLength = function() {
        return ckDataLength;
    };
}

//  Export public APIs.
module.exports = {
    "RIFFChunk": RIFFChunk
};