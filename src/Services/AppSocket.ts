import { exposedHeaders } from "@/configs/constants";
import { AppError } from "@/Helpers/AppError";
import { instrument } from "@socket.io/admin-ui";
import type http from "http";
import io from "socket.io";
export class AppSocket {
  private static server: io.Server;
  private constructor() {
    throw new AppError("AppSocket cannot be initialized directly.");
  }

  public static init(server?: http.Server): io.Server {
    if (AppSocket.server) {
      return AppSocket.server;
    }
    AppSocket.server = new io.Server(server, {
      cors: {
        origin: "*",
        exposedHeaders,
        methods: ["GET", "POST", "DELETE", "PUT"],
      },
    });

    instrument(AppSocket.server, {
      auth: false,
    });

    return AppSocket.server;
  }
}
