/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import _ from "lodash";
import QuickLRU from "quick-lru";
import { config } from "dotenv";
import { OperationOptions } from "retry";

import { CommonParameters } from "./commonParameters";
import { ICacheManager } from "./cacheManager";
import { CacheManagerKeyv } from "./cacheManagerKeyv";

// dotenv config loads environmental variables.
config();

/**
 * Defines all the parameters that can be reused by the client.
 *
 * @remarks
 * Headers can be overwritten when actual calls are made.
 *
 * @class ClientConfig
 */
export class ClientConfig {
  public baseUri?: string;
  public cacheManager?: ICacheManager;
  public headers?: { [key: string]: string };
  public parameters?: CommonParameters;
  public retrySettings?: OperationOptions;
}

const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  // Enables quick-lru for local caching by default
  // Limits to 10000 unique entities to cache before
  // replacing least recently used (LRU) entities
  cacheManager: new CacheManagerKeyv({
    keyvStore: new QuickLRU({ maxSize: 10000 }),
  }),
  headers: {
    "content-type": "application/json",
    connection: "close",
  },
  parameters: {
    // Ideally, when version is set as a parameter in the baseUri, it's gets
    // filled in from the version field in the RAML. Until that's implemented,
    // we'll default to v1.
    version: "v1",
  },
};

/**
 * A basic implementation of a client that all the Commerce API clients extend.
 *
 * @class BaseClient
 */
export class BaseClient {
  public clientConfig: ClientConfig;

  constructor(config?: ClientConfig) {
    this.clientConfig = {};
    _.merge(this.clientConfig, DEFAULT_CLIENT_CONFIG, config);
  }
}

export { Response } from "minipass-fetch";
export { ResponseError } from "./staticClient";
