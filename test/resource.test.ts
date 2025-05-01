/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
"use strict";

import { Resource } from "../src/base/resource";

import { assert } from "chai";

describe("Resource class tests", () => {
  it("returns baseUri when only baseUri is set", () => {
    assert.strictEqual(new Resource("baseUri").toString(), "baseUri");
  });

  it("returns baseUri with param when only baseUri and param is set", () => {
    assert.strictEqual(
      new Resource("{param}Uri", { param: "base" }).toString(),
      "baseUri"
    );
  });

  it("returns baseUri with params when only baseUri and two params is set", () => {
    assert.strictEqual(
      new Resource("{param}Uri/{p2}", {
        param: "base",
        p2: "value",
      }).toString(),
      "baseUri/value"
    );
  });

  it("returns baseUri with param and path with param", () => {
    assert.strictEqual(
      new Resource("{param}Uri", { param: "base" }, "/path{param}", {
        param: "1",
      }).toString(),
      "baseUri/path1"
    );
  });

  it("returns only baseUri + path when there's no template params in path", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path").toString(),
      "baseUri/path"
    );
  });

  it("throws an error when path parameter is missing", () => {
    assert.throws(
      () => new Resource("baseUri", {}, "/path/{param}").toString(),
      Error,
      "Failed to find a value for required path parameter 'param'"
    );
  });

  it("returns resource with substitution", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path/{param}", {
        param: "value",
      }).toString(),
      "baseUri/path/value"
    );
  });

  it("returns resource with multiple substitutions", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path/{param}/and/{another-one}", {
        param: "value",
        "another-one": "value2",
      }).toString(),
      "baseUri/path/value/and/value2"
    );
  });

  it("returns correct url with one query param", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: "v1" }).toString(),
      "baseUri/path?q1=v1"
    );
  });

  it("returns correct url with one query param array single element", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: ["v1"] }).toString(),
      "baseUri/path?q1=v1"
    );
  });

  it("returns correct url with one query param array two element (comma separated)", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: ["v1", "v2"] }).toString(),
      "baseUri/path?q1=v1%2Cv2"
    );
  });

  it("returns correct url with one query param array no element", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: [] }).toString(),
      "baseUri/path"
    );
  });

  it("returns correct url with two query param", () => {
    assert.strictEqual(
      new Resource(
        "baseUri",
        {},
        "/path",
        {},
        { q1: "v1", query_param_2: "value 2" }
      ).toString(),
      "baseUri/path?q1=v1&query_param_2=value%202"
    );
  });

  it("returns correct url with two query param, one of them array", () => {
    assert.strictEqual(
      new Resource(
        "baseUri",
        {},
        "/path",
        {},
        { q1: ["v1", "v2"], query_param_2: "value 2" }
      ).toString(),
      "baseUri/path?q1=v1%2Cv2&query_param_2=value%202"
    );
  });

  it("returns correct url with one null query param", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: null }).toString(),
      "baseUri/path?q1="
    );
  });

  it("returns correct url with one undefined query param", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: undefined }).toString(),
      "baseUri/path"
    );
  });

  it("returns correct url with one empty string query param", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: "" }).toString(),
      "baseUri/path?q1="
    );
  });

  it("returns correct url with one numeric query param", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { q1: 1 }).toString(),
      "baseUri/path?q1=1"
    );
  });

  it("returns correct url with two path param and two query param", () => {
    assert.strictEqual(
      new Resource(
        "baseUri",
        {},
        "/path/{first-id}/and/{second-id}",
        { "first-id": "id1", "second-id": "id2" },
        { firstQueryParam: "v1", "second-query-param": "value 2" }
      ).toString(),
      "baseUri/path/id1/and/id2?firstQueryParam=v1&second-query-param=value%202"
    );
  });

  it("returns correct url with boolean query parameter set to true", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { bool: true }).toString(),
      "baseUri/path?bool=true"
    );
  });

  it("returns correct url with boolean query parameter set to false", () => {
    assert.strictEqual(
      new Resource("baseUri", {}, "/path", {}, { bool: false }).toString(),
      "baseUri/path?bool=false"
    );
  });

  it("returns 'refine' query parameter in expanded format instead of comma separated", () => {
    assert.strictEqual(
      new Resource(
        "baseUri",
        {},
        "/path",
        {},
        {
          refine: ["price=(0..150)", "c_refinementColor=Red"],
          expand: ["availability", "images"],
        }
      ).toString(),
      "baseUri/path?expand=availability%2Cimages&refine=price%3D%280..150%29&refine=c_refinementColor%3DRed"
      // URI decoded: baseUri/path?expand=availability,images&refine=price=(0..150)&refine=c_refinementColor=Red
    );
  });
});
