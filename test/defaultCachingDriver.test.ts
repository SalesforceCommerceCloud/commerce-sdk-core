/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { BaseClient } from "../src";
import cacheTests from "./cacheHelpers/basic.test.helper";
import etagTests from "./cacheHelpers/etag.test.helper";
import evictionTests from "./cacheHelpers/eviction.test.helper";
import multipleHeadersTests from "./cacheHelpers/multipleHeaders.test.helper";
import noCacheHeaderTests from "./cacheHelpers/noCacheHeader.test.helper";
import delayedTests from "./cacheHelpers/delayedTests.test.helper";

describe("Default cache tests", function () {
  before(function () {
    this.client = new BaseClient({
      baseUri: "https://somewhere",
    });
  });
  cacheTests();
  etagTests();
  evictionTests();
  multipleHeadersTests();
  noCacheHeaderTests();
  delayedTests();
});
