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
const FS = 
    require("fs");
const Util = 
    require("util");

//  Imported classes.
const IRIFFReadAccessor = 
    RiIoAccessor.IRIFFReadAccessor;
const IRIFFWriteAccessor = 
    RiIoAccessor.IRIFFWriteAccessor;
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

//  Read accessor flags.
const RDBITMASK_ENDED = 0x01;

//  Write accessor flags.
const WRBITMASK_ENDED = 0x01;

//
//  Classes.
//

/**
 *  RIFF file read accessor.
 * 
 *  @constructor
 *  @extends {IRIFFReadAccessor}
 *  @param {Number} fd
 *    - The file descriptor.
 *  @param {Number} baseOffset
 *    - The base offset.
 *  @param {EventFlags} flags
 *    - The flags.
 *  @param {Boolean} toplevel
 *    - True if the accessor is the top-level accessor.
 */
function RIFFFileReadAccessor(
    fd,
    baseOffset,
    flags,
    toplevel
) {
    //  Let parent class initialize.
    IRIFFReadAccessor.call(this);

    //
    //  Public methods.
    //

    /**
     *  Get the file descriptor.
     * 
     *  @returns {Number}
     *    - The file descriptor.
     */
    this.getFileDescriptor = function() {
        return fd;
    };

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

        //  Ensure accessor opened.
        if ((flags.value & RDBITMASK_ENDED) != 0) {
            throw new RIFFIOError(
                "The accessor was already ended."
            );
        }

        //  Read the file.
        let buffer = Buffer.allocUnsafe(length);
        let syncLocalData = new ConditionalSynchronizer();
        let syncLocalError = new ConditionalSynchronizer();
        FS.read(
            fd,
            buffer,
            0,
            length,
            baseOffset + address,
            function(error, nBytesRead) {
                if (error) {
                    syncLocalError.fullfill(new RIFFIOError(Util.format(
                        "I/O exception (error=\"%s\").",
                        error.message || "Unknown error."
                    )));
                    return;
                }
                if (nBytesRead != length) {
                    syncLocalError.fullfill(new RIFFIOError(
                        "Address overflow."
                    ));
                    return;
                }
                syncLocalData.fullfill(buffer);
            }
        );

        //  Wait for signals.
        let cts = new ConditionalSynchronizer();
        let wh1 = syncLocalData.waitWithCancellator(cts);
        let wh2 = syncLocalError.waitWithCancellator(cts);
        let wh3 = cancellator.waitWithCancellator(cts);
        let wh4 = flags.pend(
            RDBITMASK_ENDED, 
            EventFlags.PEND_FLAG_SET_ALL, 
            cts
        );
        let rsv = await CreatePreemptivePromise([wh1, wh2, wh3, wh4]);
        cts.fullfill();

        //  Handle the signal.
        let wh = rsv.getPromiseObject();
        if (wh == wh1) {
            return rsv.getValue();
        } else if (wh == wh2) {
            throw rsv.getValue();
        } else if (wh == wh3) {
            throw new RIFFOperationCancelledError(
                "The cancellator was activated."
            );
        } else if (wh == wh4) {
            throw new RIFFIOError(
                "File closed."
            );
        } else {
            ReportBug("Invalid wait handler.", true, RIFFBugError);
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
        return new RIFFFileReadAccessor(
            fd,
            baseOffset + offset,
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
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @returns {Promise<void>}
     *    - The promise object (resolves if succeed, rejects if error occurred).
     */
    this.end = async function() {
        //  Ensure top-level.
        if (!toplevel) {
            throw new RIFFInvalidOperationError(
                "Not top-level accessor."
            );
        }

        //  Ensure accessor opened.
        if ((flags.value & RDBITMASK_ENDED) != 0) {
            throw new RIFFInvalidOperationError(
                "The accessor was already ended."
            );
        }

        //  Close the file.
        await new Promise(function(resolve, reject) {
            FS.close(fd, function(error) {
                if (error) {
                    reject(new RIFFIOError(Util.format(
                        "I/O exception (error=\"%s\").",
                        error.message || "Unknown error."
                    )));
                } else {
                    resolve();
                }
            });
        });

        //  Mark the ended flag.
        flags.post(RDBITMASK_ENDED, EventFlags.POST_FLAG_SET);
    };
}

/**
 *  Create a new RIFF file read accessor.
 * 
 *  @throws {RIFFIOError}
 *    - I/O error.
 *  @throws {RIFFOperationCancelledError}
 *    - The cancellator was activated.
 *  @param {String} path
 *    - The file path.
 *  @param {ConditionalSynchronizer} [cancellator]
 *    - The cancellator.
 *  @returns {Promise<RIFFFileReadAccessor>}
 *    - The promise object (resolves with the file read accessor if succeed, 
 *      rejects if error occurred).
 */
RIFFFileReadAccessor.Open = async function(
    path,
    cancellator = new ConditionalSynchronizer()
) {
    //  Open the file.
    let syncLocalOpened = new ConditionalSynchronizer();
    let syncLocalError = new ConditionalSynchronizer();
    FS.open(path, FS.constants.O_RDONLY, function(error, fd) {
        if (error) {
            syncLocalError.fullfill(new RIFFIOError(Util.format(
                "I/O exception (error=\"%s\").",
                error.message || "Unknown error."
            )));
        } else {
            syncLocalOpened.fullfill(fd);
        }
    });

    //  Wait for signals.
    let cts = new ConditionalSynchronizer();
    let wh1 = syncLocalOpened.waitWithCancellator(cts);
    let wh2 = syncLocalError.waitWithCancellator(cts);
    let wh3 = cancellator.waitWithCancellator(cts);
    let rsv = await CreatePreemptivePromise([wh1, wh2, wh3]);
    cts.fullfill();

    //  Handle the signal.
    let wh = rsv.getPromiseObject();
    if (wh == wh1) {
        let fd = rsv.getValue();
        return new RIFFFileReadAccessor(
            fd,
            0,
            new EventFlags(0x00),
            true
        );
    } else if (wh == wh2) {
        throw rsv.getValue();
    } else if (wh == wh3) {
        syncLocalOpened.wait().then(function(fd) {
            try {
                FS.closeSync(fd);
            } catch(error) {
                //  Do nothing.
            }
        });
        throw new RIFFOperationCancelledError(
            "The cancellator was activated."
        );
    } else {
        ReportBug("Invalid wait handler.", true, RIFFBugError);
    }
};

/**
 *  RIFF file write accessor.
 * 
 *  @constructor
 *  @extends {IRIFFWriteAccessor}
 *  @param {Number} fd
 *    - The file descriptor.
 *  @param {Number} baseOffset
 *    - The base offset.
 *  @param {EventFlags} flags
 *    - The flags.
 *  @param {Boolean} toplevel
 *    - True if the accessor is the top-level accessor.
 */
function RIFFFileWriteAccessor(
    fd,
    baseOffset,
    flags,
    toplevel
) {
    //  Let parent class initialize.
    IRIFFWriteAccessor.call(this);

    //
    //  Public methods.
    //

    /**
     *  Get the file descriptor.
     * 
     *  @returns {Number}
     *    - The file descriptor.
     */
    this.getFileDescriptor = function() {
        return fd;
    };

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

        //  Ensure accessor opened.
        if ((flags.value & WRBITMASK_ENDED) != 0) {
            throw new RIFFIOError(
                "The accessor was already ended."
            );
        }

        //  Write file.
        let syncLocalWritten = new ConditionalSynchronizer();
        let syncLocalError = new ConditionalSynchronizer();
        FS.write(
            fd,
            data,
            0,
            data.length,
            baseOffset + address,
            function(error, nBytesWritten) {
                if (error) {
                    syncLocalError.fullfill(new RIFFIOError(Util.format(
                        "I/O exception (error=\"%s\").",
                        error.message || "Unknown error."
                    )));
                    return;
                }
                if (nBytesWritten != data.length) {
                    syncLocalError.fullfill(new RIFFIOError(
                        "Incorrect length of written data."
                    ));
                    return;
                }
                syncLocalWritten.fullfill();
            }
        );

        //  Wait for signals.
        let cts = new ConditionalSynchronizer();
        let wh1 = syncLocalWritten.waitWithCancellator(cts);
        let wh2 = syncLocalError.waitWithCancellator(cts);
        let wh3 = cancellator.waitWithCancellator(cts);
        let wh4 = flags.pend(
            WRBITMASK_ENDED,
            EventFlags.PEND_FLAG_SET_ALL,
            cts
        );
        let rsv = await CreatePreemptivePromise([wh1, wh2, wh3, wh4]);
        cts.fullfill();

        //  Handle the signal.
        let wh = rsv.getPromiseObject();
        if (wh == wh1) {
            return;
        } else if (wh == wh2) {
            throw rsv.getValue();
        } else if (wh == wh3) {
            throw new RIFFOperationCancelledError(
                "The cancellator was activated."
            );
        } else if (wh == wh4) {
            throw new RIFFIOError(
                "File closed."
            );
        } else {
            ReportBug("Invalid wait handler.", true, RIFFBugError);
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
        return new RIFFFileWriteAccessor(
            fd,
            baseOffset + offset,
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
     *  @throws {RIFFIOError}
     *    - I/O error.
     *  @returns {Promise<void>}
     *    - The promise object (resolves if succeed, rejects if error occurred).
     */
    this.end = async function() {
        //  Ensure top-level.
        if (!toplevel) {
            throw new RIFFInvalidOperationError(
                "Not top-level accessor."
            );
        }

        //  Ensure accessor opened.
        if ((flags.value & WRBITMASK_ENDED) != 0) {
            throw new RIFFInvalidOperationError(
                "The accessor was already ended."
            );
        }

        //  Close the file.
        await new Promise(function(resolve, reject) {
            FS.close(fd, function(error) {
                if (error) {
                    reject(new RIFFIOError(Util.format(
                        "I/O exception (error=\"%s\").",
                        error.message || "Unknown error."
                    )));
                } else {
                    resolve();
                }
            });
        });

        //  Mark the ended flag.
        flags.post(WRBITMASK_ENDED, EventFlags.POST_FLAG_SET);
    };
}

/**
 *  Create a new RIFF file write accessor.
 * 
 *  @throws {RIFFIOError}
 *    - I/O error.
 *  @throws {RIFFOperationCancelledError}
 *    - The cancellator was activated.
 *  @param {String} path
 *    - The file path.
 *  @param {ConditionalSynchronizer} [cancellator]
 *    - The cancellator.
 *  @returns {Promise<RIFFFileWriteAccessor>}
 *    - The promise object (resolves with the file write accessor if succeed, 
 *      rejects if error occurred).
 */
RIFFFileWriteAccessor.Open = async function(
    path,
    cancellator = new ConditionalSynchronizer()
) {
    //  Open the file.
    let syncLocalOpened = new ConditionalSynchronizer();
    let syncLocalError = new ConditionalSynchronizer();
    FS.open(
        path, 
        (FS.constants.O_WRONLY | FS.constants.O_CREAT | FS.constants.O_TRUNC), 
        function(error, fd) {
            if (error) {
                syncLocalError.fullfill(new RIFFIOError(Util.format(
                    "I/O exception (error=\"%s\").",
                    error.message || "Unknown error."
                )));
            } else {
                syncLocalOpened.fullfill(fd);
            }
        }
    );

    //  Wait for signals.
    let cts = new ConditionalSynchronizer();
    let wh1 = syncLocalOpened.waitWithCancellator(cts);
    let wh2 = syncLocalError.waitWithCancellator(cts);
    let wh3 = cancellator.waitWithCancellator(cts);
    let rsv = await CreatePreemptivePromise([wh1, wh2, wh3]);
    cts.fullfill();

    //  Handle the signal.
    let wh = rsv.getPromiseObject();
    if (wh == wh1) {
        let fd = rsv.getValue();
        return new RIFFFileWriteAccessor(
            fd,
            0,
            new EventFlags(0x00),
            true
        );
    } else if (wh == wh2) {
        throw rsv.getValue();
    } else if (wh == wh3) {
        syncLocalOpened.wait().then(function(fd) {
            try {
                FS.closeSync(fd);
            } catch(error) {
                //  Do nothing.
            }
        });
        throw new RIFFOperationCancelledError(
            "The cancellator was activated."
        );
    } else {
        ReportBug("Invalid wait handler.", true, RIFFBugError);
    }
};

//
//  Inheritances.
//
Util.inherits(RIFFFileReadAccessor, IRIFFReadAccessor);
Util.inherits(RIFFFileWriteAccessor, IRIFFWriteAccessor);

//  Export public APIs.
module.exports = {
    "RIFFFileReadAccessor": RIFFFileReadAccessor,
    "RIFFFileWriteAccessor": RIFFFileWriteAccessor
};