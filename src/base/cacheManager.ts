/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { Request, Response } from "node-fetch";

interface ICacheQueryOptions {
  ignoreMethod?: boolean;
  ignoreSearch?: boolean;
  ignoreVary?: boolean;
}

/**
 * This interface is the Web API Cache interface, with some methods marked as optional.
 * It's recommended to not modify this so it conforms to the spec.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Cache
 */
export interface ICacheManager {
  // Returns a Promise that resolves to the response associated with the first matching request in the Cache object.
  match(
    request: Request,
    options?: ICacheQueryOptions
  ): Promise<Response | undefined>;

  // Returns a Promise that resolves to an array of all matching requests in the Cache object.
  matchAll?(
    request?: Request,
    options?: ICacheQueryOptions
  ): Promise<ReadonlyArray<Response>>;

  // Takes a URL, retrieves it and adds the resulting response object to the given cache. This is functionally equivalent to calling fetch(), then using put() to add the results to the cache.
  add?(request: Request): Promise<void>;

  // Takes an array of URLs, retrieves them, and adds the resulting response objects to the given cache.
  addAll?(requests: Request[]): Promise<void>;

  // Takes both a request and its response and adds it to the given cache.
  put(request: Request, response: Response): Promise<void>;

  // Finds the Cache entry whose key is the request, returning a Promise that resolves to true if a matching Cache entry is found and deleted. If no Cache entry is found, the promise resolves to false.
  delete(request: Request, options?: ICacheQueryOptions): Promise<boolean>;

  // Returns a Promise that resolves to an array of Cache keys.
  keys?(
    request?: Request,
    options?: ICacheQueryOptions
  ): Promise<ReadonlyArray<Request>>;
}
