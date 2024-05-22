import { type Request, type Response, type NextFunction } from 'express'
import { inHTMLData } from 'xss-filters'

export default (req: Request, res: Response, next: NextFunction) => {
  if (req.body) req.body = cleanData(req.body)
  if (req.query) req.query = cleanData(req.query)
  if (req.params) req.params = cleanData(req.params)
  next()
}

/**
 *
 * @param {string | object} data - The data to sanitize
 * @return {string | object} - The sanitized data
 */
function cleanData (data: string | object): any {
  let isObject = false
  if (typeof data === 'object') {
    data = JSON.stringify(data)
    isObject = true
  }

  data = inHTMLData(data).trim()
  if (isObject) data = JSON.parse(data)

  return data
}
