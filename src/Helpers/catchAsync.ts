import { type NextFunction, type Request, type Response } from 'express'

/**
 * Wrapper around the controller to handle any exception threw
 * in the controller and send it over to the exception handler middleware
 * @param {Function} fn
 * @return {void}
 */
export default function catchAsync (fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    return fn(req, res, next)!.catch((err: any) => { next(err) })
  }
}
