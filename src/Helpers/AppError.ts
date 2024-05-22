/* eslint-disable require-jsdoc */
export class AppError extends Error {
  public statusCode: number
  public message: string
  public status: string
  public isOperational: boolean

  constructor (message: string, statusCode: number = 500) {
    super(message)
    this.message = message
    this.statusCode = statusCode || 500
    this.status = 'failed'
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}
