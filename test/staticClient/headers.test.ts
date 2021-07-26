/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import nock from "nock";
import { expect } from "chai";

import { BaseClient } from "../../src/base/client";
import {
  _get,
  _post,
  getHeaders,
  mergeHeaders,
} from "../../src/base/staticClient";

// Common headers used in tests
const CONNECTION_CLOSE = { connection: "close" };
const CONNECTION_KEEP_ALIVE = { connection: "keep-alive" };
const LANGUAGE_HEADER = { "Accept-Language": "en-US" };

describe("Base Client headers", () => {
  describe("Headers specified on client", () => {
    afterEach(nock.cleanAll);

    const TWO_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10",
    };

    it("makes correct get call with headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: LANGUAGE_HEADER,
      });
      nock("https://headers.test", { reqheaders: LANGUAGE_HEADER })
        .get("/client/get/headers")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/get/headers" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call with two headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: TWO_HEADER,
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .get("/client/get/two/headers")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/get/two/headers" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call for post with two headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: TWO_HEADER,
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .post("/client/post/two/headers")
        .reply(201, {});

      await _post({
        client: client,
        path: "/client/post/two/headers",
        body: {},
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with connection header set to close by default", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
      });

      nock("https://headers.test", { reqheaders: CONNECTION_CLOSE })
        .get("/client/connection/close")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/close" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with the connection header set in the client", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: CONNECTION_KEEP_ALIVE,
      });

      nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
        .get("/client/connection/alive")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/alive" });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with the connection header set in the client", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: CONNECTION_KEEP_ALIVE,
      });

      nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
        .get("/client/connection/alive")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/alive" });
      expect(nock.isDone()).to.be.true;
    });

    it("combines headers specified with different cases", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: {
          "user-agent": "commerce-sdk",
          "User-Agent": "commerce-sdk",
        },
      });

      nock("https://headers.test", {
        reqheaders: {
          "user-agent": "commerce-sdk, commerce-sdk",
        },
      })
        .get("/client/connection/alive")
        .reply(200, { mock: "data" });

      await _get({ client: client, path: "/client/connection/alive" });
      expect(nock.isDone()).to.be.true;
    });
  });

  describe("Headers specified at endpoint", () => {
    afterEach(nock.cleanAll);

    const LANGUAGE_HEADER = { "Accept-Language": "en-US" };
    const TWO_HEADER = {
      "Accept-Language": "fr-CH",
      "Max-Forwards": "10",
    };
    const MERGE_HEADER = {
      "Accept-Language": "en-US",
      "Max-Forwards": "10",
    };

    it("makes correct get call with endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
      });
      nock("https://headers.test", { reqheaders: LANGUAGE_HEADER })
        .get("/get/with/language")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/get/with/language",
        headers: LANGUAGE_HEADER,
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call with two endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .get("/get/two/headers")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/get/two/headers",
        headers: TWO_HEADER,
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call for post with two endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
      });
      nock("https://headers.test", { reqheaders: TWO_HEADER })
        .post("/post/two/headers")
        .reply(201, {});

      await _post({
        client: client,
        path: "/post/two/headers",
        headers: TWO_HEADER,
        body: {},
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes correct call for post with client and endpoint headers", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
        headers: TWO_HEADER,
      });
      nock("https://headers.test", { reqheaders: MERGE_HEADER })
        .post("/post/with/header")
        .reply(201, {});

      await _post({
        client: client,
        path: "/post/with/header",
        headers: LANGUAGE_HEADER,
        body: {},
      });
      expect(nock.isDone()).to.be.true;
    });

    it("Overriding a header works with different casing", async () => {
      const client = new BaseClient({
        baseUri: "https://override.test",
        headers: { authorization: "Testing" },
      });

      nock("https://override.test")
        .get("/auth/changed/casing")
        .matchHeader("Authorization", "Changed")
        .reply(200, {});

      await _get({
        client: client,
        path: "/auth/changed/casing",
        headers: { Authorization: "Changed" },
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with connection header passed to the get function ", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
      });

      nock("https://headers.test", { reqheaders: CONNECTION_KEEP_ALIVE })
        .get("/connection/header")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/connection/header",
        headers: CONNECTION_KEEP_ALIVE,
      });
      expect(nock.isDone()).to.be.true;
    });

    it("makes call with connection header passed to the get function ", async () => {
      const client = new BaseClient({
        baseUri: "https://headers.test",
      });

      nock("https://headers.test", {
        reqheaders: {
          "user-agent": "commerce-sdk, commerce-sdk",
        },
      })
        .get("/connection/header")
        .reply(200, { mock: "data" });

      await _get({
        client: client,
        path: "/connection/header",
        headers: {
          "user-agent": "commerce-sdk",
          "User-Agent": "commerce-sdk",
        },
      });
      expect(nock.isDone()).to.be.true;
    });

    it("merges with headers from client", async () => {
      const client = new BaseClient({
        baseUri: "https://override.test",
        headers: { "X-Custom-Header": "Custom" },
      });

      nock("https://override.test")
        .get("/merge/headers")
        .matchHeader("Authorization", "Changed")
        .matchHeader("X-Custom-Header", "Custom")
        .reply(200, {});

      await _get({
        client: client,
        path: "/merge/headers",
        headers: { Authorization: "Changed" },
      });
      expect(nock.isDone()).to.be.true;
    });

    it("overrides duplicate headers from client", async () => {
      const client = new BaseClient({
        baseUri: "https://override.test",
        headers: { "X-Custom-Header": "from client" },
      });

      nock("https://override.test")
        .get("/merge/headers")
        .matchHeader("X-Custom-Header", "from endpoint")
        .reply(200, {});

      await _get({
        client: client,
        path: "/merge/headers",
        headers: { "X-Custom-Header": "from endpoint" },
      });
      expect(nock.isDone()).to.be.true;
    });
  });
});

describe("Headers helpers", () => {
  describe("getHeaders", () => {
    it("clones headers from options with headers", () => {
      const expected = { Accept: "application/json" };
      expect(getHeaders({ headers: expected })).to.not.equal(expected);
      expect(getHeaders({ headers: expected })).to.deep.equal(expected);
    });

    it("returns an empty object from options without headers", () => {
      expect(getHeaders({})).to.be.an("object").that.is.empty;
    });

    it("returns an empty object not given options", () => {
      expect(getHeaders()).to.be.an("object").that.is.empty;
    });
  });

  describe("mergeHeaders", () => {
    it("merges different headers from different objects", () => {
      expect(mergeHeaders({ a: "A" }, { b: "B" }, { c: "C" })).to.deep.equal({
        a: "A",
        b: "B",
        c: "C",
      });
    });
  });

  it("merges same headers from different objects", () => {
    expect(
      mergeHeaders({ message: "Hello" }, { message: "world!" })
    ).to.deep.equal({
      message: "Hello, world!",
    });
  });
});
