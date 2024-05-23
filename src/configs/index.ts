import { Environment, LogLevel } from "@/configs/type";

const parsedEnv = process.env;

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
    name: string;
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

export const config: Config = {
  app: {
    frontendUrl: parsedEnv.FRONTEND_URL as string,
    name: parsedEnv.APP_NAME as string | "default",
  },

  basePath: "",
  privateKeyPath: parsedEnv.PRIVATE_KEY_FILE as string,
  privateKeyPassphrase: parsedEnv.PRIVATE_KEY_PASSPHRASE as string,
  publicKeyPath: parsedEnv.PUBLIC_KEY_FILE as string,

  localCacheTtl: parsedEnv.LOCAL_CACHE_TTL as any,
  redisUrl: parsedEnv.REDIS_URL as string,

  google: {
    clientSecret: parsedEnv.GOOGLE_CLIENT_SECRET as string,
    clientId: parsedEnv.GOOGLE_AUTH_CLIENT_ID as string,
  },

  mail: {
    username: parsedEnv.EMAIL_USERNAME as string,
    password: parsedEnv.EMAIL_PASSWORD as string,
    port: parsedEnv.EMAIL_PORT as any,
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
    port: parsedEnv.DATABASE_PORT as any,
    host: parsedEnv.DATABASE_HOST as string,
    database: parsedEnv.DATABASE_NAME as string,
  },

  morgan: {
    logger: parsedEnv.MORGAN_LOGGER as any,
    body: parsedEnv.MORGAN_BODY_LOGGER as any,
  },

  loglevel: parsedEnv.LOGGER_LEVEL as LogLevel,
  applogger: parsedEnv.APP_LOGGER as any,
  environment: parsedEnv.NODE_ENV as Environment,
};

export * as constants from "@/configs/constants";
export * as types from "@/configs/type";
