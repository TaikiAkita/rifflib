//
//  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
//  Use of this source code is governed by a BSD-style license that can be
//  found in the LICENSE.md file.
//

//
//  Public functions.
//

/**
 *  Copy an array.
 * 
 *  @param {Array} a
 *    - The source array.
 *  @returns {Array}
 *    - The copied array.
 */
function ArrayCopy(a) {
    let r = [];
    for (let i = 0; i < a.length; ++i) {
        r.push(a[i]);
    }
    return r;
}

//  Export public APIs.
module.exports = {
    "ArrayCopy": ArrayCopy
};