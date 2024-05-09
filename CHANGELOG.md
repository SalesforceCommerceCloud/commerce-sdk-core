# CHANGELOG

## 1.7.0

* Expose underlying helper function for fetch calls

## 1.6.1

* Arrays passed as query parameters follow the comma separated format except for the `refine` query parameter which follows the repeated format

## 1.6.0

* Fetch options are able to be passed on the client configuration level as well as on a per call basis
* Homepage link now points to the [Salesforce Developer Portal](https://developer.salesforce.com/docs/commerce/commerce-api)

## 1.5.5

* Add support for endpoints that accept `application/x-www-form-urlencoded` instead of `application/json` (i.e. SLAS).

## 1.5.4

* Support boolean query parameters

## 1.5.3

* Different case headers specified when invoking a method will now properly be merged, rather than only one being used.
Headers specified when invoking a method will overwrite headers specified in the client config, regardless of case.

## 1.5.2

* Security updates

## 1.5.1

* Security updates

## 1.5.0

* Removed raml-toolkit as a runtime dependency
* Refactored cache manager to be more object orientated
  * Exposed more options within the cache manager
  * Fixed type definitions within the cache manager

## 1.4.10

* Updated to TypeScript 3.9
* Removed "beta" tag
