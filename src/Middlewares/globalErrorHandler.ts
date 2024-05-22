import { AppError } from "@/Helpers/AppError";
import messages from "@/Helpers/messages";
import { type NextFunction, type Request, type Response } from "express";

// Handle database errors
const handleCastError = function (err: any) {
  const message = `Invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};

/**
 *
 * Send error in development environment
 *
 * @param {Error | AppError} err - Error object
 * @param {Response} res - Response object
 */
const sendDevelopmentError = async (err: any, res: Response) => {

  // Send meaningful message to client
  return res.status(err.statusCode || 500).json({
    status: err.status,
    message: err.message,
    error: err,
    stackTrace: err.stack,
  });
};

// Handle JsonWebTokenError
const handleJWTError = () => new AppError(messages.ACCESS_INV_ERR, 403);
const handleJWTExpiredError = () => new AppError(messages.ACCESS_EXP_ERR, 403);

/**
 *
 * Send error in production environment
 *
 * @param {AppError | Error} err - Error object
 * @param {Response} res - Response object
 */
const sendProductionError = async (err: any, res: Response) => {
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      status: err.status,
      message: err.message,
      error: err,
    });
  } else {
    return res.status(500).json({
      status: "failed",
      message: messages.UNKNOWN_ERR,
      error: err,
      stack: err.stack,
    });
  }
};

/**
 * This will handle global error
 *
 * @param {AppError} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
export default async function globalErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let error = err;

  if (error.name === "CastError") {
    error = handleCastError(error);
  }
  // if (error.code === 1022) {
  // 	error = handleDuplicateEntry(error);
  // }
  if (error.name === "JsonWebTokenError") {
    error = handleJWTError();
  }
  if (
    error.name === "TokenExpiredError" ||
    error.message.includes("Token used too late")
  ) {
    error = handleJWTExpiredError();
  }

  // Handle production error
  if (process.env.NODE_ENV === "production") {
    await sendProductionError(error, res);
  } else if (process.env.NODE_ENV === "development") {
    sendDevelopmentError(error, res);
  }
}
