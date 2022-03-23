/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import sinon from "sinon";
import { BaseClient } from "../src/base/client";
import { assert } from "chai";
import proxyquire from "proxyquire";
describe("Fetch Options", () => {
  const fetchStub = sinon.stub();
  const staticClient = proxyquire("../src/base/staticClient", {
    "make-fetch-happen": fetchStub,
  });

  beforeEach(() => {
    fetchStub.reset();
    fetchStub.returns({
      ok: "ok",
      status: "status",
      headers: { raw: (): string => "" },
    });
  });

  it("can be passed in from client config", async () => {
    const uri = "https://localhost:3000";
    const client = new BaseClient({
      baseUri: uri,
      fetchOptions: { redirect: "manual" },
    });
    await staticClient._get({ client: client, path: "", rawResponse: true });
    const passedFetchOptions = fetchStub.getCall(0).args[1];
    assert(passedFetchOptions.hasOwnProperty("redirect"));
    assert(passedFetchOptions.redirect === "manual");
  });

  it("can be passed in as SdkFetchOptions", async () => {
    const uri = "https://localhost:3000";
    const client = new BaseClient({
      baseUri: uri,
    });
    await staticClient._get({
      client: client,
      path: "",
      rawResponse: true,
      fetchOptions: { redirect: "manual" },
    });
    const passedFetchOptions = fetchStub.getCall(0).args[1];
    assert(passedFetchOptions.hasOwnProperty("redirect"));
    assert(passedFetchOptions.redirect === "manual");
  });

  it("can be passed in from both client config and SdkFetchOptions", async () => {
    const uri = "https://localhost:3000";
    const client = new BaseClient({
      baseUri: uri,
      fetchOptions: { size: 1000 },
    });
    await staticClient._get({
      client: client,
      path: "",
      rawResponse: true,
      fetchOptions: { redirect: "manual" },
    });
    const passedFetchOptions = fetchStub.getCall(0).args[1];
    assert(passedFetchOptions.hasOwnProperty("size"));
    assert(passedFetchOptions.hasOwnProperty("redirect"));
    assert(passedFetchOptions.size === 1000);
    assert(passedFetchOptions.redirect === "manual");
  });

  it("prioritizes SdkFetchOptions over client config", async () => {
    const uri = "https://localhost:3000";
    const client = new BaseClient({
      baseUri: uri,
      fetchOptions: { redirect: "follow" },
    });
    await staticClient._get({
      client: client,
      path: "",
      rawResponse: true,
      fetchOptions: { redirect: "manual" },
    });
    const passedFetchOptions = fetchStub.getCall(0).args[1];
    assert(passedFetchOptions.hasOwnProperty("redirect"));
    assert(passedFetchOptions.redirect === "manual");
  });
});
