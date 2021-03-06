/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { Response, Headers } from "minipass-fetch";
import sinon from "sinon";
import fetchToCurl from "fetch-to-curl";

import { logFetch, logResponse } from "../src/base/staticClient";
import { sdkLogger } from "../src/base/sdkLogger";
import { LogLevelDesc } from "loglevel";

describe("Static Client format log tests", () => {
  let stub: sinon.SinonStub;
  let logLevel: LogLevelDesc;

  before(() => {
    logLevel = sdkLogger.getLevel();
  });

  after(() => {
    //reset log level
    sdkLogger.setLevel(logLevel);
  });

  beforeEach(() => sinon.restore());

  afterEach(() => stub.restore());

  describe("Test info log messages of fetch data", () => {
    before(() => sdkLogger.setLevel(sdkLogger.levels.INFO));

    beforeEach(() => {
      stub = sinon.stub(sdkLogger, "info");
    });

    it("formats basic get correctly", () => {
      const resource = "https://example.com/my/endpoint";
      const options = { method: "GET" };
      const output = "Request: GET https://example.com/my/endpoint";
      logFetch(resource, options);
      sinon.assert.calledWith(stub, output);
    });

    it("formats get with query params correctly", () => {
      const resource = "https://example.com/my/endpoint?myparam=value";
      const options = { method: "GET" };
      const output =
        "Request: GET https://example.com/my/endpoint?myparam=value";
      logFetch(resource, options);
      sinon.assert.calledWith(stub, output);
    });

    it("formats basic POST correctly", () => {
      const resource = "https://example.com/my/endpoint";
      const options = { method: "POST" };
      const output = "Request: POST https://example.com/my/endpoint";
      logFetch(resource, options);
      sinon.assert.calledWith(stub, output);
    });
  });

  function getDebugMsgForFetch(resource, options): string {
    return `Fetch Options: ${JSON.stringify(
      options,
      null,
      2
    )}\nCurl: ${fetchToCurl(resource, options)}`;
  }

  describe("Test debug log messages of fetch data", () => {
    let stub: sinon.SinonStub;

    before(() => sdkLogger.setLevel(sdkLogger.levels.DEBUG));

    beforeEach(() => {
      sinon.stub(sdkLogger, "info");
      stub = sinon.stub(sdkLogger, "debug");
    });

    it("formats basic get correctly", () => {
      const resource = "https://example.com/my/endpoint";
      const options = { method: "GET" };
      logFetch(resource, options);
      sinon.assert.calledWith(stub, getDebugMsgForFetch(resource, options));
    });

    it("formats get with query params correctly", () => {
      const resource = "https://example.com/my/endpoint?myparam=value";
      const options = { method: "GET" };
      logFetch(resource, options);
      sinon.assert.calledWith(stub, getDebugMsgForFetch(resource, options));
    });

    it("formats basic POST correctly", () => {
      const resource = "https://example.com/my/endpoint";
      const options = {
        method: "POST",
        body: JSON.stringify({ key1: "value1" }),
      };
      logFetch(resource, options);
      sinon.assert.calledWith(stub, getDebugMsgForFetch(resource, options));
    });
  });

  describe("Test info log messages of response data", () => {
    let stub: sinon.SinonStub;

    before(() => sdkLogger.setLevel(sdkLogger.levels.INFO));

    beforeEach(() => {
      stub = sinon.stub(sdkLogger, "info");
      sinon.stub(sdkLogger, "debug");
    });

    it("formats success response correctly", () => {
      const response: Response = new Response(
        {},
        { status: 200, statusText: "Everything is ok" }
      );
      const output = "Response: successful 200 Everything is ok";
      logResponse(response);
      sinon.assert.calledWith(stub, output);
    });

    it("formats created response correctly", () => {
      const response: Response = new Response(
        {},
        { status: 201, statusText: "Everything is created" }
      );
      const output = "Response: successful 201 Everything is created";
      logResponse(response);
      sinon.assert.calledWith(stub, output);
    });

    it("formats not modified response correctly", () => {
      const response: Response = new Response(
        {},
        { status: 304, statusText: "Everything is the same" }
      );
      const output = "Response: successful 304 Everything is the same";
      logResponse(response);
      sinon.assert.calledWith(stub, output);
    });

    it("formats 404 response correctly", () => {
      const response: Response = new Response(
        {},
        { status: 404, statusText: "Everything is gone" }
      );
      const output = "Response: unsuccessful 404 Everything is gone";
      logResponse(response);
      sinon.assert.calledWith(stub, output);
    });
  });

  describe("Test debug log messages of response data", () => {
    let stub: sinon.SinonStub;

    before(() => sdkLogger.setLevel(sdkLogger.levels.DEBUG));

    beforeEach(() => {
      stub = sinon.stub(sdkLogger, "debug");
    });

    it("formats response with headers correctly", () => {
      const respHeaders = new Headers();
      respHeaders.append("Content-Type", "application/json");
      const response: Response = new Response(
        {},
        { status: 200, statusText: "Everything is ok", headers: respHeaders }
      );

      const output = `Response Headers: ${JSON.stringify(
        respHeaders.raw(),
        null,
        2
      )}`;
      logResponse(response);
      sinon.assert.calledWith(stub, output);
    });
  });
});
