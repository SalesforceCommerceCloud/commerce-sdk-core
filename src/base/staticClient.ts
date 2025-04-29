/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { Response, BodyInit, RequestInit } from "node-fetch";
import fetch from "make-fetch-happen";
import _ from "lodash";
import fetchToCurl from "fetch-to-curl";
import { Headers } from "minipass-fetch";
import { OperationOptions } from "retry";
import KeyvRedis from "@keyv/redis";
import { URLSearchParams } from "url";

import {
  BasicHeaders,
  PathParameters,
  QueryParameters,
  Resource,
} from "./resource";
import { BaseClient } from "./client";
import { sdkLogger } from "./sdkLogger";

export { DefaultCache } from "make-fetch-happen/cache";
export { Response };

export type SdkFetchOptions = {
  client: BaseClient;
  path: string;
  pathParameters?: PathParameters;
  queryParameters?: QueryParameters;
  headers?: BasicHeaders;
  rawResponse?: boolean;
  retrySettings?: OperationOptions;
  fetchOptions?: RequestInit;
  disableTransformBody?: boolean;
  body?: unknown;
};

export type SdkFetchOptionsNoBody = Omit<SdkFetchOptions, "body">;
export type SdkFetchOptionsWithBody = SdkFetchOptionsNoBody &
  Required<Pick<SdkFetchOptions, "body">>;

/**
 * Extends the Error class with the the error being a combination of status code
 * and text retrieved from the response.
 *
 * @class ResponseError
 * @extends Error
 */
export class ResponseError extends Error {
  constructor(public response: Response) {
    super(`${response.status} ${response.statusText}`);
  }
}

/**
 * Returns the dto object from the given response object on status codes 2xx and
 * 304 (Not Modified). The fetch library make-fetch-happen returns the cached object
 * on 304 response. This method throws error on any other 3xx responses that are not
 * automatically handled by make-fetch-happen.
 *
 * @remarks
 * Refer to https://en.wikipedia.org/wiki/List_of_HTTP_status_codes for more information
 * on HTTP status codes.
 *
 * @param response - A response object either containing a dto or an error
 * @returns The DTO wrapped in a promise
 *
 * @throws a ResponseError if the status code of the response is neither 2XX nor 304
 */
export async function getObjectFromResponse(
  response: Response
): Promise<object | Record<string, unknown>> {
  if (response.ok || response.status === 304) {
    const text = await response.text();
    // It's ideal to get "{}" for an empty response body, but we won't throw if it's truly empty
    return text ? JSON.parse(text) : {};
  } else {
    throw new ResponseError(response);
  }
}

/**
 * Log request/fetch details.
 *
 * @param resource The resource being requested
 * @param fetchOptions The options to the fetch call
 */
export function logFetch(
  resource: string,
  fetchOptions: fetch.FetchOptions
): void {
  sdkLogger.info(`Request: ${fetchOptions.method.toUpperCase()} ${resource}`);
  sdkLogger.debug(
    `Fetch Options: ${JSON.stringify(
      fetchOptions,
      function reducer(key, val) {
        if (this instanceof KeyvRedis && key === "redis") {
          return "<Removed from log by @commerce-apps/core, as it is not serializable>";
        }
        return val;
      },
      2
    )}\nCurl: ${fetchToCurl(resource, fetchOptions)}`
  );
}

/**
 * Log response details.
 *
 * @param response The response received
 */
export const logResponse = (response: Response): void => {
  const successString =
    response.ok || response.status === 304 ? "successful" : "unsuccessful";
  const msg = `Response: ${successString} ${response.status} ${response.statusText}`;
  sdkLogger.info(msg);
  sdkLogger.debug(
    `Response Headers: ${JSON.stringify(response.headers.raw(), null, 2)}`
  );
};

export const getHeaders = (options?: {
  headers?: BasicHeaders;
}): BasicHeaders => {
  return options?.headers ? { ...options.headers } : {};
};

export const mergeHeaders = (...allHeaders: BasicHeaders[]): BasicHeaders => {
  const merged: BasicHeaders = {};
  for (const head of allHeaders) {
    for (const [key, value] of Object.entries(head)) {
      merged[key] = merged[key] ? `${merged[key]}, ${value}` : value;
    }
  }
  return merged;
};

/**
 * Transforms a request body into a format matching the media type of the request.
 * @param body Unparsed request body
 * @param request Request data
 * @returns Parsed request body that can be used by `fetch`.
 */
export const transformRequestBody = (
  body: unknown,
  request: fetch.FetchOptions
): BodyInit => {
  const contentType = request.headers?.["content-type"];
  if (!contentType) {
    // Preserve default behavior from versions <= 1.5.4
    return JSON.stringify(body);
  }
  switch (contentType) {
    case "application/json":
      return JSON.stringify(body);
    case "application/x-www-form-urlencoded":
      // The type def for URLSearchParams is restrictive. `Record<string, any>` will work, as the
      // values get cast to strings. In any case, the only API that currently uses this media type
      // is SLAS, and all of their params are strings.
      return new URLSearchParams(body as Record<string, string>);
    default:
      // All types used by the APIs are currently covered; this would require stuff
      return body as BodyInit;
  }
};

/**
 * Makes an HTTP call specified by the method parameter with the options passed.
 *
 * @param method - Type of HTTP operation
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export async function runFetch(
  method: "delete" | "get" | "patch" | "post" | "put",
  options: SdkFetchOptions
): Promise<object> {
  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.client.clientConfig.parameters,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();

  // Multiple headers can be specified by using different cases. The `Headers`
  // class handles this automatically. It also normalizes header names to all lower case.
  const headers = new Headers(options.client.clientConfig.headers);
  for (const [header, value] of new Headers(options.headers)) {
    // Headers specified on the request will _replace_ those specified on the
    // client, rather than be appended to them.
    headers.set(header, value);
  }

  const fetchOptions: fetch.FetchOptions = {
    ...options.client.clientConfig.fetchOptions,
    ...options.fetchOptions,
    // This type assertion is technically inaccurate, as some properties may
    // be missing. Also, Cache uses the browser Request, but ICacheManager uses
    // node-fetch's Request, which has additional properties.
    // This is unlikely to cause issues, but it might? It's probably temporary,
    // anyway, as the latest make-fetch-happen drops support for cacheManager.
    cacheManager: options.client.clientConfig.cacheManager as unknown as Cache,
    method: method,
    // The package `http-cache-semantics` (used by `make-fetch-happen`) expects
    // headers to be plain objects, not instances of Headers.
    // TODO: _.fromPairs can be replaced with Object.fromEntries when support
    // for node v10 is dropped.
    headers: _.fromPairs([...headers]),
    retry: {
      ...options.client.clientConfig.retrySettings,
      ...options.retrySettings,
    },
  };

  if (typeof options.body !== "undefined") {
    fetchOptions.body = options.disableTransformBody
      ? (options.body as BodyInit)
      : transformRequestBody(options.body, fetchOptions);
  }

  logFetch(resource, fetchOptions);
  const response = await fetch(resource, fetchOptions);
  logResponse(response);

  return options.rawResponse ? response : getObjectFromResponse(response);
}

/**
 * Performs an HTTP GET operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export async function _get(options: SdkFetchOptionsNoBody): Promise<object> {
  return runFetch("get", options);
}

/**
 * Performs an HTTP DELETE operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export async function _delete(options: SdkFetchOptionsNoBody): Promise<object> {
  return runFetch("delete", options);
}

/**
 * Performs an HTTP PATCH operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export async function _patch(
  options: SdkFetchOptionsWithBody
): Promise<object> {
  return runFetch("patch", options);
}

/**
 * Performs an HTTP POST operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export async function _post(options: SdkFetchOptionsWithBody): Promise<object> {
  return runFetch("post", options);
}

/**
 * Performs an HTTP PUT operation with the options passed.
 *
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
export async function _put(options: SdkFetchOptionsWithBody): Promise<object> {
  return runFetch("put", options);
}
