//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const Util = require("util");

//
//  Classes.
//

/**
 *  RIFF error.
 * 
 *  @constructor
 *  @extends {Error}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFError(message = "") {
    //  Let parent class initialize.
    Error.call(this, message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

/**
 *  RIFF bug error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFBugError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF parameter error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFParameterError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF invalid operation error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFInvalidOperationError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF operation cancelled error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFOperationCancelledError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF serialize error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFSerializeError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF deserialize error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFDeserializeError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF deserializer not accepted error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFDeserializerNotAcceptedError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF deserializer existed error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFDeserializerExistedError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFF deserializer not exists error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFDeserializerNotExistsError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

/**
 *  RIFFIO error.
 * 
 *  @constructor
 *  @extends {RIFFError}
 *  @param {String} [message]
 *      - The message.
 */
function RIFFIOError(message = "") {
    //  Let parent class initialize.
    RIFFError.call(this, message);
}

//
//  Inheritances.
//
Util.inherits(RIFFError, Error);
Util.inherits(RIFFBugError, RIFFError);
Util.inherits(RIFFParameterError, RIFFError);
Util.inherits(RIFFInvalidOperationError, RIFFError);
Util.inherits(RIFFOperationCancelledError, RIFFError);
Util.inherits(RIFFSerializeError, RIFFError);
Util.inherits(RIFFDeserializeError, RIFFError);
Util.inherits(RIFFDeserializerNotAcceptedError, RIFFError);
Util.inherits(RIFFDeserializerExistedError, RIFFError);
Util.inherits(RIFFDeserializerNotExistsError, RIFFError);
Util.inherits(RIFFIOError, RIFFError);

//  Export public APIs.
module.exports = {
    "RIFFError": RIFFError,
    "RIFFBugError": RIFFBugError,
    "RIFFParameterError": RIFFParameterError,
    "RIFFInvalidOperationError": RIFFInvalidOperationError,
    "RIFFOperationCancelledError": RIFFOperationCancelledError,
    "RIFFSerializeError": RIFFSerializeError,
    "RIFFDeserializeError": RIFFDeserializeError,
    "RIFFDeserializerNotAcceptedError": RIFFDeserializerNotAcceptedError,
    "RIFFDeserializerExistedError": RIFFDeserializerExistedError,
    "RIFFDeserializerNotExistsError": RIFFDeserializerNotExistsError,
    "RIFFIOError": RIFFIOError
};