const {$} = require('wajez-utils')

const Router = $.Any
const Request = $.Any
const Response = $.Any
const NextFunction = $.AnyFunction
const Middleware = $.AnyFunction
// $.Function([Request, Response, NextFunction, $.Any])
const ErrorHandler = $.Function([$.Any, Request, Response, NextFunction, $.Any])

module.exports = {
  Router,
  Request,
  Response,
  NextFunction,
  Middleware,
  ErrorHandler
}
