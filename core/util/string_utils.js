//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public functions.
//

/**
 *  Convert string to codepoints.
 * 
 *  @param {String} str
 *    - The string.
 *  @returns {Number[]}
 *    - The Unicode codepoints.
 */
function ToCodepoints(str) {
    let pos = 0;
    let codepoints = [];
    while (pos < str.length) {
        let hi = str.charCodeAt(pos);
        if (hi >= 0xD800 && hi <= 0xDBFF && pos + 1 < str.length) {
            let lo = str.charCodeAt(pos + 1);
            if (lo >= 0xDC00 && lo <= 0xDFFF) {
                codepoints.push(
                    0x10000 + ((hi - 0xD800) << 10) + (lo - 0xDC00)
                );
                pos += 2;
            } else {
                codepoints.push(hi);
                ++(pos);
            }
        } else {
            codepoints.push(hi);
            ++(pos);
        }
    }
    return codepoints;
}

//  Export public APIs.
module.exports = {
    "ToCodepoints": ToCodepoints
};