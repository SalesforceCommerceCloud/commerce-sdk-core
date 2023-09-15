/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import qs from "qs";

export type BasicHeaders = Record<string, string>;
export type BaseUriParameters = Record<string, string>;
export type PathParameters = Record<string, string>;
export type QueryParameters = Record<
  string,
  boolean | string | number | string[] | number[]
>;

/**
 * A class to render a flattened URL from the parts including template
 * parameters. Out of the various options to render an array in a query string,
 * this class comma seperates the value for each element of the array,
 * i.e. {a: [1, 2]} => "?a=1,2". One exception is the 'refine' query param as
 * SCAPI expects the repeated format, i.e. {refine: [1, 2]} => "?refine=1&refine=2"
 *
 * @class Resource
 */
export class Resource {
  constructor(
    private baseUri: string,
    private baseUriParameters: BaseUriParameters = {},
    private path = "",
    private pathParameters: PathParameters = {},
    private queryParameters: QueryParameters = {}
  ) {}

  /**
   * Substitutes template parameters in the path with matching parameters.
   *
   * @param path - String containing template parameters
   * @param parameters - All the parameters that should substitute the template
   * parameters
   * @returns Path with actual parameters
   */
  substitutePathParameters(path = "", parameters: PathParameters = {}): string {
    return path.replace(/\{([^}]+)\}/g, (_entireMatch, param) => {
      if (parameters.hasOwnProperty(param) && parameters[param] !== undefined) {
        return parameters[param];
      }
      throw new Error(
        `Failed to find a value for required path parameter '${param}'`
      );
    });
  }

  /**
   * Create a url from a baseUri, path and query parameters.
   *
   * @returns Rendered URL
   */
  toString(): string {
    const renderedBaseUri = this.substitutePathParameters(
      this.baseUri,
      this.baseUriParameters
    );

    const renderedPath = this.substitutePathParameters(
      this.path,
      this.pathParameters
    );

    // separate 'refine' query parameter from the rest as it is encoded differently
    const { refine, ...queryParams } = this.queryParameters;

    let queryString = qs.stringify(queryParams, {
      arrayFormat: "comma",
    });

    if (refine) {
      queryString += `&${qs.stringify({ refine }, { arrayFormat: "repeat" })}`;
    }

    return `${renderedBaseUri}${renderedPath}${
      queryString ? "?" : ""
    }${queryString}`;
  }
}
