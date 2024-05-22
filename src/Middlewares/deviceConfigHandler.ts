import { type NextFunction, type Request, type Response } from 'express'

const DeviceDetector = require('node-device-detector')
const ClientHints = require('node-device-detector/client-hints')
// init app
const deviceDetector = new DeviceDetector({
  clientIndexes: true,
  deviceIndexes: true,
  deviceAliasCode: false
})
const clientHints = new ClientHints()

export default function deviceConfigHandler (req: Request | any, res: Response, next: NextFunction) {
  const useragent = req.headers['user-agent']
  const clientHintsData = clientHints.parse(req.headers)

  req.useragent = useragent
  req.device = deviceDetector.detect(useragent, clientHintsData)
  req.bot = deviceDetector.parseBot(useragent)
  next()
};
