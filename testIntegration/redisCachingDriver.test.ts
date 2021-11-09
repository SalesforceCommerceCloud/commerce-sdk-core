/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { BaseClient, CacheManagerRedis } from "../src";
import cacheTests from "../test/cacheHelpers/basic.test.helper";
import etagTests from "../test/cacheHelpers/etag.test.helper";
import evictionTests from "../test/cacheHelpers/eviction.test.helper";
import multipleHeadersTests from "../test/cacheHelpers/multipleHeaders.test.helper";
import noCacheHeaderTests from "../test/cacheHelpers/noCacheHeader.test.helper";
import delayedTests from "../test/cacheHelpers/delayedTests.test.helper";

describe("Redis cache tests", () => {
  before(function () {
    this.client = new BaseClient({
      baseUri: "https://somewhere",
      cacheManager: new CacheManagerRedis({
        connection: "redis://localhost",
        keyvOptions: { keepAlive: false },
      }),
    });
  });
  after(async function () {
    const cacheManager: CacheManagerRedis<unknown> =
      this.client.clientConfig.cacheManager;
    await cacheManager.keyv.clear();
    await cacheManager.quit();
  });
  cacheTests();
  etagTests();
  evictionTests();
  multipleHeadersTests();
  noCacheHeaderTests();
  delayedTests();
});
