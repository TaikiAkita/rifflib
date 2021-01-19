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
const XRTLibBugHandler = 
    require("xrtlibrary-bughandler");
const Util = 
    require("util");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const RIFFBugError = 
    RiError.RIFFBugError;
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

//  Imported functions.
const CreatePreemptivePromise = 
    XRTLibAsync.Asynchronize.Preempt.CreatePreemptivePromise;
const ReportBug = 
    XRTLibBugHandler.ReportBug;

//
//  Constants.
//

//  Write accessor flags.
const WRBITMASK_ENDED = 0x01;

//  Notification bit masks.
const NTFYBIT_UPDATE = 0x01;

//
//  Classes.
//

/**
 *  RIFF stream read accessor.
 * 
 *  @constructor
 *  @extends {IRIFFReadAccessor}
 *  @param {Number[]} byteArray
 *    - The byte array.
 *  @param {Number} byteArrayOffset
 *    - The offset of the byte array.
 *  @param {Set<EventFlags>} notifiers
 *    - The notifiers.
 *  @param {EventFlags} flags
 *    - The flags.
 *  @param {Boolean} toplevel
 *    - True if the accessor is the top-level accessor.
 */
function RIFFStreamReadAccessor(
    byteArray,
    byteArrayOffset,
    notifiers,
    flags,
    toplevel
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

        //  Calculate the offset range.
        let offsetBegin = byteArrayOffset + address;
        let offsetEnd = offsetBegin + length;

        while(true) {
            //  Get the data if the data was already available.
            if (offsetEnd <= byteArray.length) {
                return Buffer.from(byteArray.slice(offsetBegin, offsetEnd));
            }

            //  Ensure stream opened.
            if ((flags.value & WRBITMASK_ENDED) != 0) {
                throw new RIFFIOError(
                    "Address overflow."
                );
            }

            //  Wait for stream to be changed.
            let notifier = new EventFlags(0x00);
            notifiers.add(notifier);
            try {
                //  Wait for signals.
                let cts = new ConditionalSynchronizer();
                let wh1 = notifier.pend(
                    NTFYBIT_UPDATE,
                    EventFlags.PEND_FLAG_SET_ALL,
                    cts
                );
                let wh2 = cancellator.waitWithCancellator(cts);
                let rsv = await CreatePreemptivePromise([wh1, wh2]);
                cts.fullfill();

                //  Handle the signal.
                let wh = rsv.getPromiseObject();
                if (wh == wh1) {
                    continue;
                } else if (wh == wh2) {
                    throw new RIFFOperationCancelledError(
                        "The cancellator was activated."
                    );
                } else {
                    ReportBug("Invalid wait handler.", true, RIFFBugError);
                }
            } finally {
                notifiers.delete(notifier);
            }
        }
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
        return new RIFFStreamReadAccessor(
            byteArray,
            byteArrayOffset + offset,
            notifiers,
            flags,
            false
        );
    };

    /**
     *  Append bytes to the stream.
     * 
     *  Note(s):
     *    [1] This method is only available to the top-level accessor.
     * 
     *  @throws {RIFFInvalidOperationError}
     *    - One of following errors occurred:
     *      - The stream was already ended.
     *      - Not top-level accessor.
     *  @param {Buffer} bytes
     *    - The bytes.
     */
    this.append = function(bytes) {
        //  Ensure top-level.
        if (!toplevel) {
            throw new RIFFInvalidOperationError(
                "Not top-level accessor."
            );
        }

        //  Ensure stream opened.
        if ((flags.value & WRBITMASK_ENDED) != 0) {
            throw new RIFFInvalidOperationError(
                "The stream was already ended."
            );
        }

        //  Append the bytes.
        for (let i = 0; i < bytes.length; ++i) {
            byteArray.push(bytes.readUInt8(i));
        }

        //  Notify all waiters.
        notifiers.forEach(function(notifier) {
            notifier.post(NTFYBIT_UPDATE, EventFlags.POST_FLAG_SET);
        });
    };

    /**
     *  End the stream.
     * 
     *  Note(s):
     *    [1] All sub accessors would also be ended.
     *    [2] This method is only available to the top-level accessor.
     * 
     *  @throws {RIFFInvalidOperationError}
     *    - One of following errors occurred:
     *      - The stream was already ended.
     *      - Not top-level accessor.
     */
    this.end = function() {
        //  Ensure top-level.
        if (!toplevel) {
            throw new RIFFInvalidOperationError(
                "Not top-level accessor."
            );
        }

        //  Ensure stream opened.
        if ((flags.value & WRBITMASK_ENDED) != 0) {
            throw new RIFFInvalidOperationError(
                "The stream was already ended."
            );
        }

        //  Notify all waiters.
        notifiers.forEach(function(notifier) {
            notifier.post(NTFYBIT_UPDATE, EventFlags.POST_FLAG_SET);
        });

        //  Mark the ended flag.
        flags.post(WRBITMASK_ENDED, EventFlags.POST_FLAG_SET);
    };
}

/**
 *  Create a new (top-level) stream read accessor.
 * 
 *  @returns {RIFFStreamReadAccessor}
 *    - The stream read accessor.
 */
RIFFStreamReadAccessor.New = function() {
    return new RIFFStreamReadAccessor(
        [],
        0,
        new Set(),
        new EventFlags(0x00),
        true
    );
};

//
//  Inheritances.
//
Util.inherits(RIFFStreamReadAccessor, IRIFFReadAccessor);

//  Export public APIs.
module.exports = {
    "RIFFStreamReadAccessor": RIFFStreamReadAccessor
};