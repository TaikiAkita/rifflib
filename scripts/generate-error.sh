#!/bin/sh
#
#  Copyright 2018 - 2021 The RIFFLib Authors. All rights reserved.
#  Use of this source code is governed by a BSD-style license that can be
#  found in the LICENSE.md file.
#

#  Go to the script directory.
SCRIPTREALPATH="`realpath \"$0\"`"
cd "`dirname \"${SCRIPTREALPATH}\"`"

#  Go to project root directory.
cd ".."

#  Generate the error file.
python3 scripts/ecg/generate.py RIFF error.template error.js

exit $?
