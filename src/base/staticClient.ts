/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { Response } from "node-fetch";
import fetch from "make-fetch-happen";
import _ from "lodash";
import fetchToCurl from "fetch-to-curl";
import { Headers } from "minipass-fetch";
import { OperationOptions } from "retry";
import Redis from "ioredis";

import { Resource } from "./resource";
import { BaseClient } from "./client";
import { sdkLogger } from "./sdkLogger";

export { DefaultCache } from "make-fetch-happen/cache";
export { Response };

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
): Promise<object> {
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
  // TODO: Remove this workaround when @types/node-fetch bug is fixed
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/54674
  fetchOptions: Omit<fetch.FetchOptions, "headers"> & { headers?: Headers }
): void {
  sdkLogger.info(`Request: ${fetchOptions.method.toUpperCase()} ${resource}`);
  sdkLogger.debug(
    `Fetch Options: ${JSON.stringify(
      fetchOptions,
      // Redis clusters have circular references and can't be converted to JSON
      (key, val) => (val instanceof Redis.Cluster ? "<Redis Cluster>" : val),
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

/**
 * Makes an HTTP call specified by the method parameter with the options passed.
 *
 * @param method - Type of HTTP operation
 * @param options - Details to be used for making the HTTP call and processing
 * the response
 * @returns Either the Response object or the DTO inside it wrapped in a promise,
 * depending upon options.rawResponse
 */
async function runFetch(
  method: "delete" | "get" | "patch" | "post" | "put",
  options: {
    client: BaseClient;
    path: string;
    pathParameters?: object;
    queryParameters?: object;
    headers?: { [key: string]: string };
    rawResponse?: boolean;
    retrySettings?: OperationOptions;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    body?: any;
  }
): Promise<object> {
  const resource = new Resource(
    options.client.clientConfig.baseUri,
    options.client.clientConfig.parameters,
    options.path,
    options.pathParameters,
    options.queryParameters
  ).toString();

  // Multiple headers can be specified by using different cases. The `Headers`
  // class handles this automatically.
  const headers = new Headers(options.client.clientConfig.headers);
  for (const [header, value] of new Headers(options.headers)) {
    // Headers specified on the request will _replace_ those specified on the
    // client, rather than be appended to them.
    headers.set(header, value);
  }

  const fetchOptions: fetch.FetchOptions = {
    // This type assertion is technically inaccurate, as some properties may
    // be missing. However, it hasn't caused issues yet, and it's just temporary
    // because the latest make-fetch-happen drops support for cacheManager.
    cacheManager: options.client.clientConfig.cacheManager as Cache,
    method: method,
    body: JSON.stringify(options.body),
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
export function _get(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  retrySettings?: OperationOptions;
  rawResponse?: boolean;
}): Promise<object> {
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
export function _delete(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  retrySettings?: OperationOptions;
  rawResponse?: boolean;
}): Promise<object> {
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
export function _patch(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  retrySettings?: OperationOptions;
  rawResponse?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
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
export function _post(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  retrySettings?: OperationOptions;
  rawResponse?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
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
export function _put(options: {
  client: BaseClient;
  path: string;
  pathParameters?: object;
  queryParameters?: object;
  headers?: { [key: string]: string };
  retrySettings?: OperationOptions;
  rawResponse?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any;
}): Promise<object> {
  return runFetch("put", options);
}
