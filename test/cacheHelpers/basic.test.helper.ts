/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import chai from "chai";
import nock from "nock";
import { StaticClient, BaseClient } from "../../src/";

/**
 * Basic tests for Salesforce Commerce SDK cache manager interface.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default () => {
  const expect = chai.expect;

  describe("base client get test", function () {
    afterEach(nock.cleanAll);

    it("makes correct call once", async function () {
      nock("https://somewhere").get("/once").reply(200, { mock: "data" });

      const data = await StaticClient.get({
        client: this.client,
        path: "/once",
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.true;
    });

    it("does not get from cache with request max-age=0", async function () {
      const scope = nock("https://somewhere")
        .get("/max-age-zero")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=0" });
      scope
        .get("/max-age-zero")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=0" });

      const data = await StaticClient.get({
        client: this.client,
        path: "/max-age-zero",
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      const returnedData = await StaticClient.get({
        client: this.client,
        path: "/max-age-zero",
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("gets from cache with response expires fresh", async function () {
      const scope = nock("https://somewhere")
        .get("/fresh")
        .reply(
          200,
          { mock: "data" },
          { Expires: "Sun, 03 May 2055 23:02:37 GMT" }
        );
      scope
        .get("/fresh")
        .reply(
          200,
          { mock: "newData" },
          { Expires: "Sun, 03 May 2055 23:02:37 GMT" }
        );

      const data = await StaticClient.get({
        client: this.client,
        path: "/fresh",
      });
      expect(data).to.deep.equal({ mock: "data" });
      const returnedData = await StaticClient.get({
        client: this.client,
        path: "/fresh",
      });
      expect(returnedData).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
    });

    it("does not get from cache with response expires expired", async function () {
      const scope = nock("https://somewhere")
        .get("/expired")
        .reply(
          200,
          { mock: "data" },
          { Expires: "Sun, 03 May 2015 23:02:37 GMT" }
        );

      const data = await StaticClient.get({
        client: this.client,
        path: "/expired",
      });
      expect(data).to.deep.equal({ mock: "data" });
      scope
        .get("/expired")
        .reply(
          200,
          { mock: "newData" },
          { Expires: "Sun, 03 May 2025 23:02:37 GMT" }
        );
      const returnedData = await StaticClient.get({
        client: this.client,
        path: "/expired",
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("caches with request max-age", async function () {
      const scope = nock("https://somewhere")
        .get("/max-age")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
      scope
        .get("/max-age")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.get({
        client: this.client,
        path: "/max-age",
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      const returnedData = await StaticClient.get({
        client: this.client,
        path: "/max-age",
      });
      expect(returnedData).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
    });

    it("bypasses caches with no cache", async function () {
      const client = new BaseClient({
        baseUri: "https://somewhere",
        cacheManager: null,
      });
      const scope = nock("https://somewhere")
        .get("/max-age-null-cache")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
      scope
        .get("/max-age-null-cache")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.get({
        client: client,
        path: "/max-age-null-cache",
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      const returnedData = await StaticClient.get({
        client: client,
        path: "/max-age-null-cache",
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("bypasses cache with no-cache", async function () {
      const scope = nock("https://somewhere")
        .get("/max-age-no-cache")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.get({
        client: this.client,
        path: "/max-age-no-cache",
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.true;
      scope
        .get("/max-age-no-cache")
        .matchHeader("authorization", "Bearer token")
        .matchHeader("accept", "text/plain, text/html")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });
      const returnedData = await StaticClient.get({
        client: this.client,
        path: "/max-age-no-cache",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: "Bearer token",
          Accept: "text/plain, text/html",
        },
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("bypasses cache with default", async function () {
      const scope = nock("https://somewhere")
        .get("/max-age-default")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.get({
        client: this.client,
        path: "/max-age-default",
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.true;
      scope
        .get("/max-age-default")
        .matchHeader("authorization", "Bearer token")
        .matchHeader("accept", "text/plain, text/html")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });
      const returnedData = await StaticClient.get({
        client: this.client,
        path: "/max-age-default",
        headers: {
          "Cache-Control": "no-cache",
          Authorization: "Bearer token",
          Accept: "text/plain, text/html",
        },
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("doesn't cache post request max-age", async function () {
      const scope = nock("https://somewhere")
        .post("/post-max-age")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
      scope
        .post("/post-max-age")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.post({
        client: this.client,
        path: "/post-max-age",
        body: {},
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      const returnedData = await StaticClient.post({
        client: this.client,
        path: "/post-max-age",
        body: {},
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("doesn't cache patch request max-age", async function () {
      const scope = nock("https://somewhere")
        .patch("/patch-max-age")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
      scope
        .patch("/patch-max-age")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.patch({
        client: this.client,
        path: "/patch-max-age",
        body: {},
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      const returnedData = await StaticClient.patch({
        client: this.client,
        path: "/patch-max-age",
        body: {},
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });

    it("doesn't cache put request max-age", async function () {
      const scope = nock("https://somewhere")
        .put("/put-max-age")
        .reply(200, { mock: "data" }, { "Cache-Control": "max-age=604800" });
      scope
        .put("/put-max-age")
        .reply(200, { mock: "newData" }, { "Cache-Control": "max-age=604800" });

      const data = await StaticClient.put({
        client: this.client,
        path: "/put-max-age",
        body: {},
      });
      expect(data).to.deep.equal({ mock: "data" });
      expect(nock.isDone()).to.be.false;
      const returnedData = await StaticClient.put({
        client: this.client,
        path: "/put-max-age",
        body: {},
      });
      expect(returnedData).to.deep.equal({ mock: "newData" });
      expect(nock.isDone()).to.be.true;
    });
  });
};
