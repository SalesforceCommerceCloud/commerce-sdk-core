/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * A subset of the Web API Cache interface.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Cache
 */
type RequiredKeys = "delete" | "match" | "put";
export type ICacheManager = Pick<Cache, RequiredKeys> & Partial<Cache>;
