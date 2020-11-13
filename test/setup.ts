/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import sinon from "sinon";
import { sdkLogger } from "../src";

let consoleStub: sinon.SinonStub;
let sdkLoggerInfoStub: sinon.SinonStub;
let sdkLoggerDebugStub: sinon.SinonStub;

beforeEach(() => {
  consoleStub = sinon.stub(console, "log");
  sdkLoggerInfoStub = sinon.stub(sdkLogger, "info");
  sdkLoggerDebugStub = sinon.stub(sdkLogger, "debug");
});

afterEach(() => {
  consoleStub.restore();
  sdkLoggerInfoStub.restore();
  sdkLoggerDebugStub.restore();
});
