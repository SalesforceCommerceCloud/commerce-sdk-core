/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import { expect } from "chai";
import log from "loglevel";
import { sdkLogger, COMMERCE_SDK_LOGGER_KEY } from "../src";

describe("Logger utility", () => {
  let logLevel: log.LogLevelDesc;

  before(() => {
    logLevel = sdkLogger.getLevel();
  });

  after(() => {
    // Restore original log level
    sdkLogger.setLevel(logLevel);
  });

  it("is accessible via loglevel interface", async () => {
    expect(log.getLogger(COMMERCE_SDK_LOGGER_KEY)).to.equal(sdkLogger);
  });

  it("defaults to WARN log level", async () => {
    expect(sdkLogger.getLevel()).to.equal(log.levels.WARN);
  });

  it("can have log level changed", async () => {
    sdkLogger.setLevel(sdkLogger.levels.DEBUG);
    expect(sdkLogger.getLevel()).to.equal(log.levels.DEBUG);
  });
});
