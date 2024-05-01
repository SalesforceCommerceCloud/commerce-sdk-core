/*
 * Copyright (c) 2019, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export {
  BaseClient,
  ClientConfig,
  Response,
  ResponseError,
} from "./base/client";

import { _get, _delete, _patch, _post, _put, runFetch } from "./base/staticClient";

export {
  getObjectFromResponse,
  getHeaders,
  mergeHeaders,
} from "./base/staticClient";

export const StaticClient = {
  get: _get,
  delete: _delete,
  patch: _patch,
  post: _post,
  put: _put,
  runFetch,
};

export { IAuthToken, ShopperToken, stripBearer } from "./base/authHelper";

export {
  commonParameterPositions,
  CommonParameters,
} from "./base/commonParameters";

export { ICacheManager } from "./base/cacheManager";
export { CacheManagerKeyv } from "./base/cacheManagerKeyv";
export { CacheManagerRedis } from "./base/cacheManagerRedis";
export { COMMERCE_SDK_LOGGER_KEY, sdkLogger } from "./base/sdkLogger";
