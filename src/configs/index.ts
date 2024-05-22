import dotenvExtended from "dotenv-extended";
import dotenvParseVariables from "dotenv-parse-variables";

import { type Environment, type LogLevel } from "./type";

const env = dotenvExtended.load({
  path: ".env",
  defaults: "./envs/defaults.env",
  schema: "./envs/schema.env",
  includeProcessEnv: true,
  silent: false,
  errorOnMissing: true,
  errorOnExtra: true,
});
const parsedEnv = dotenvParseVariables(env);

interface Config {
  privateKeyPath: string;
  environment: Environment;
  privateKeyPassphrase: string;
  publicKeyPath: string;
  basePath: string;
  localCacheTtl: number;
  redisUrl: string;
  app: {
    frontendUrl: string;
  };

  mail: {
    username: string;
    password: string;
    port: number;
    host: string;
  };

  jwt: {
    ttl: string;
    key: string;
  };

  mysql: {
    username: string;
    password: string;
    port: number;
    host: string;
    database: string;
  };

  google: {
    clientId: string;
    clientSecret: string;
  };

  alpay: {
    baseUrl: string;
    livePublicKey: string;
    livePrivateKey: string;
    testPublicKey: string;
    testPrivateKey: string;
    callbackUrl: string;
  };

  morgan: {
    logger: boolean;
    body: boolean;
  };

  loglevel: LogLevel;
  applogger: boolean;
}

const config: Config = {
  app: {
    frontendUrl: parsedEnv.FRONTEND_URL as string,
  },

  basePath: "",
  privateKeyPath: parsedEnv.PRIVATE_KEY_FILE as string,
  privateKeyPassphrase: parsedEnv.PRIVATE_KEY_PASSPHRASE as string,
  publicKeyPath: parsedEnv.PUBLIC_KEY_FILE as string,

  localCacheTtl: parsedEnv.LOCAL_CACHE_TTL as number,
  redisUrl: parsedEnv.REDIS_URL as string,

  google: {
    clientSecret: parsedEnv.GOOGLE_CLIENT_SECRET as string,
    clientId: parsedEnv.GOOGLE_AUTH_CLIENT_ID as string,
  },

  mail: {
    username: parsedEnv.EMAIL_USERNAME as string,
    password: parsedEnv.EMAIL_PASSWORD as string,
    port: parsedEnv.EMAIL_PORT as number,
    host: parsedEnv.EMAIL_HOST as string,
  },

  alpay: {
    baseUrl: parsedEnv.ALPAY_BASE_URL as string,
    livePublicKey: parsedEnv.ALPAY_LIVE_PUBLIC_KEY as string,
    livePrivateKey: parsedEnv.ALPAY_LIVE_PRIVATE_KEY as string,
    testPublicKey: parsedEnv.ALPAY_TEST_PUBLIC_KEY as string,
    testPrivateKey: parsedEnv.ALPAY_TEST_PRIVATE_KEY as string,
    callbackUrl: parsedEnv.ALPAY_CALLBACK_URL as string,
  },

  jwt: {
    key: parsedEnv.JWT_KEY as string,
    ttl: parsedEnv.JWT_TTL as string,
  },

  mysql: {
    username: parsedEnv.DATABASE_USER as string,
    password: parsedEnv.DATABASE_PASSWORD as string,
    port: parsedEnv.DATABASE_PORT as number,
    host: parsedEnv.DATABASE_HOST as string,
    database: parsedEnv.DATABASE_NAME as string,
  },

  morgan: {
    logger: parsedEnv.MORGAN_LOGGER as boolean,
    body: parsedEnv.MORGAN_BODY_LOGGER as boolean,
  },

  loglevel: parsedEnv.LOGGER_LEVEL as LogLevel,
  applogger: parsedEnv.APP_LOGGER as boolean,
  environment: parsedEnv.NODE_ENV as Environment,
};

export default config;
export * as constants from "@/configs/constants";
export * as enums from "@/configs/enums";
export * as interfaces from "@/configs/interface";
export * as type from "@/configs/type";
