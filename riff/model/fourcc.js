//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Imports.
//

//  Imported modules.
const CrStringUtils = 
    require("./../../core/util/string_utils");
const RiError = 
    require("./../../error");

//  Imported classes.
const RIFFParameterError = 
    RiError.RIFFParameterError;

//  Imported functions.
const ToCodepoints = 
    CrStringUtils.ToCodepoints;

//
//  Classes.
//

/**
 *  RIFF four-character code (FOURCC) structure.
 * 
 *  Note(s):
 *    [1] The length of the FOURCC bytes must be 4.
 * 
 *  @constructor
 *  @throws {RIFFParameterError}
 *    - Invalid FOURCC bytes.
 *  @param {Buffer} fourcc
 *    - The FOURCC bytes.
 */
function RIFFFourCC(fourcc) {
    //
    //  Parameter check.
    //

    //  Check the FOURCC bytes.
    if (fourcc.length != 4) {
        throw RIFFParameterError("Invalid FOURCC bytes.");
    }

    //
    //  Public methods.
    //

    /**
     *  Get the FOURCC bytes.
     * 
     *  @returns {Buffer}
     *    - The FOURCC bytes.
     */
    this.getBytes = function() {
        return fourcc;
    };

    /**
     *  Convert to string.
     * 
     *  @param {Boolean} [trimSpace]
     *    - True if the padding space should be trimmed.
     *  @returns {String}
     *    - The string.
     */
    this.toString = function(trimSpace = true) {
        let r = fourcc.toString("ascii");
        if (trimSpace) {
            let pos = r.lastIndexOf(" ");
            if (pos >= 0) {
                r = r.substring(0, pos);
            }
        }
        return r;
    };
}

/**
 *  Create a FOURCC from string.
 * 
 *  @throws {RIFFParameterError}
 *    - One of following error occurred:
 *      - The string is too long.
 *      - The string contains invalid codepoint.
 *  @param {String} str
 *    - The string.
 *  @returns {RIFFFourCC}
 *    - The FOURCC structure.
 */
RIFFFourCC.FromString = function(str) {
    while (str.length < 4) {
        str += " ";
    }
    let cps = ToCodepoints(str);
    if (cps.length > 4) {
        throw new RIFFParameterError(
            "The string is too long."
        );
    }
    for (let i = 0; i < cps.length; ++i) {
        if (cps[i] > 0xFF) {
            throw new RIFFParameterError(
                "The string contains invalid codepoint."
            );
        }
    }
    return new RIFFFourCC(Buffer.from(cps));
};

//  Export public APIs.
module.exports = {
    "RIFFFourCC": RIFFFourCC
};