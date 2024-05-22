import { AppError } from "@/Helpers/AppError";
import catchAsync from "@/Helpers/catchAsync";
import messages from "@/Helpers/messages";
import { validateAuthorization } from "@/Helpers/util";
import { type NextFunction, type Request, type Response } from "express";

export default catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { headers } = req;

    // Check if authorization header exists
    if (!headers.authorization) {
      next(new AppError(messages.ACCESS_REQ_ERR, 400));
      return;
    }

    const data = await validateAuthorization(headers.authorization);
    if (req.method === "GET") {
      Object.assign(req.params, data);
    } else {
      Object.assign(req.body, data);
    }
    next();
  }
);
