/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import sinon from "sinon";
import fetchToCurl from "fetch-to-curl";
import { _get } from "../src/base/staticClient";
import KeyvRedis from "@keyv/redis";
import { sdkLogger } from "../src/base/sdkLogger";
import nock from "nock";
import { BaseClient } from "../src/base/client";

function getFetchOptionsMsg(resource, fetchOptions): string {
  return `Fetch Options: ${JSON.stringify(
    fetchOptions,
    function reducer(key, val) {
      if (this instanceof KeyvRedis && key === "redis") {
        return "<Removed from log by @commerce-apps/core, as it is not serializable>";
      }
      return val;
    },
    2
  )}\nCurl: ${fetchToCurl(resource, fetchOptions)}`
}

describe("Fetch Options", () => {

    let stub: sinon.SinonStub;

    before(() => sdkLogger.setLevel(sdkLogger.levels.DEBUG));

    beforeEach(() => {
        sinon.restore();
        stub = sinon.stub(sdkLogger, "debug");
    });

    afterEach(() => stub.restore());

    const expectedFetchOptions = {
        redirect: "manual",
        cacheManager: {
            uncacheableRequestHeaders: [
            "authorization"
            ],
            keyv: {
            _events: {},
            _eventsCount: 1,
            opts: {
                namespace: "keyv",
                store: {
                maxSize: 10000,
                cache: {},
                oldCache: {},
                _size: 98,
                namespace: "keyv"
                }
            }
            }
        },
        method: "get",
        headers: {
            connection: "close",
            "content-type": "application/json",
        },
        retry: {}
    }

    it("can be passed in from client config", async () => {
        const uri = "https://localhost:3000";
        const client = new BaseClient({
            baseUri: uri,
            fetchOptions: { redirect: "manual" }
        });
        nock(uri).get("/test").reply(200);
        await _get({ client: client, path: "/test" });
        sinon.assert.calledWith(stub.firstCall, getFetchOptionsMsg(uri, expectedFetchOptions));
        // TODO:  fix test
    });

    it("can be passed in as SdkFetchOptions", async () => {
        // TODO: implement test
    });

    it("can be passed in from both client config and SdkFetchOptions", async () => {
        // TODO: implement test
    });

    it("prioritizes SdkFetchOptions over client config", async () => {
        // TODO: implement test
    });
});
