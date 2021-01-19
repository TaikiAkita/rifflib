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
const CrArrayUtils = 
    require("./../../core/util/array_utils");
const XRTLibAsync = 
    require("xrtlibrary-async");
const XRTLibBugHandler = 
    require("xrtlibrary-bughandler");
const Util = 
    require("util");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
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

//  Imported functions.
const ArrayCopy = 
    CrArrayUtils.ArrayCopy;

//
//  Type definitions.
//

/**
 *  @typedef {Object} TReadSegment
 *  @property {Number} begin
 *  @property {Number} end
 *  @property {IRIFFReadAccessor} accessor
 */

//
//  Classes.
//

/**
 *  RIFF multi-segment accessor.
 * 
 *  @constructor
 *  @extends {IRIFFReadAccessor}
 *  @param {TReadSegment[]} segments
 *    - The segments.
 *  @param {Number} baseOffset
 *    - The base offset.
 */
function RIFFMultiSegmentReadAccessor(
    segments,
    baseOffset
) {
    //  Let parent class initialize.
    IRIFFReadAccessor.call(this);

    /**
     *  Lookup one segment.
     * 
     *  @param {Number} offset
     *    - The offset.
     *  @returns {Number}
     *    - The segment ID (-1 if not exists).
     */
    function _LookupSegment(offset) {
        let left = 0;
        let right = segments.length;
        while (left < right) {
            let mid = ((left + right) >> 1);
            let segment = segments[mid];
            if (offset >= segment.end) {
                left = mid + 1;
            } else if (offset < segment.begin) {
                right = mid;
            } else {
                return mid;
            }
        }
        return -1;
    }

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

        //  Add base offset to the address.
        address += baseOffset;

        //  Allocate space.
        let buffer = Buffer.allocUnsafe(length);
        let bufferOffset = 0;

        while (length != 0) {
            //  Find the segment.
            let segmentId = _LookupSegment(address);
            if (segmentId == -1) {
                throw new RIFFIOError("Address overflow.");
            }
            let segment = segments[segmentId];

            //  Get the length of data to be read from the segment.
            let segmentRdLen = segment.end - address;
            if (segmentRdLen > length) {
                segmentRdLen = length;
            }

            //  Read from the segment.
            let segmentRdBuf = await segment.accessor.read(
                address - segment.begin,
                segmentRdLen,
                cancellator
            );

            //  Append to output buffer.
            segmentRdBuf.copy(buffer, bufferOffset);
            bufferOffset += segmentRdLen;

            //  Move to the next segment.
            address += segmentRdLen;
            length -= segmentRdLen;
        }

        return buffer;
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
        return new RIFFMultiSegmentReadAccessor(
            segments,
            baseOffset + offset
        );
    };
}

/**
 *  RIFF multi-segment read accessor factory.
 * 
 *  @constructor
 */
function RIFFMultiSegmentReadAccessorFactory() {
    //
    //  Public methods.
    //

    /**
     *  Segment list.
     * 
     *  @type {TReadSegment[]}
     */
    let segments = [];

    //  Current offset.
    let offset = 0;

    //
    //  Public methods.
    //

    /**
     *  Add one segment.
     * 
     *  @param {IRIFFReadAccessor} accessor
     *    - The segment data accessor.
     *  @param {Number} length
     *    - The segment data length.
     */
    this.add = function(accessor, length) {
        let offsetNext = offset + length;
        segments.push({
            "accessor": accessor,
            "begin": offset,
            "end": offsetNext
        });
        offset = offsetNext;
    };

    /**
     *  Create a multi-segment read accessor.
     * 
     *  @returns {RIFFMultiSegmentReadAccessor}
     *    - The multi-segment read accessor.
     */
    this.create = function() {
        return new RIFFMultiSegmentReadAccessor(ArrayCopy(segments), 0);
    };
}

//
//  Inheritances.
//
Util.inherits(RIFFMultiSegmentReadAccessor, IRIFFReadAccessor);

//  Export public APIs.
module.exports = {
    "RIFFMultiSegmentReadAccessor": RIFFMultiSegmentReadAccessor,
    "RIFFMultiSegmentReadAccessorFactory": RIFFMultiSegmentReadAccessorFactory
};