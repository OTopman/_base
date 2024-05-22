import { AppError } from "@/Helpers/AppError";
import { validateAuthorization } from "@/Helpers/util";
import { type Socket } from "socket.io";
import { type DefaultEventsMap } from "socket.io/dist/typed-events";

export default async (
  socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
  // next: (err?: Error) => void,
) => {
  const { headers } = socket.handshake;
  if (headers.authorization) {
    // Check if authorization header exists
    if (!headers.authorization) {
      throw new AppError("Invalid authorization token.", 400);
    }
    const res = await validateAuthorization(headers.authorization);
    // if (typeof socket.data === 'object') Object.assign(socket.data, res);
    return res;
  } else {
    console.log("Not found.");
  }
  // next();
};
