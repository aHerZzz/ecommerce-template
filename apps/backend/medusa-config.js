import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Modules } from "@medusajs/utils";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = (() => {
  if (process.env.ENV_FILE) {
    return path.isAbsolute(process.env.ENV_FILE)
      ? process.env.ENV_FILE
      : path.join(__dirname, process.env.ENV_FILE);
  }

  if (process.env.MEDUSA_ENV) {
    return path.join(__dirname, `.env.${process.env.MEDUSA_ENV}`);
  }

  return path.join(__dirname, ".env");
})();

dotenv.config({
  path: envFile,
});

const envFileLabel = path.relative(process.cwd(), envFile);
console.info(`Loading environment from ${envFileLabel}`);

const runningInContainer = fs.existsSync("/.dockerenv");
const runningOnLocalhost = !runningInContainer;
const usesDockerNetworkValues =
  (process.env.DATABASE_URL && /@db[:/]/.test(process.env.DATABASE_URL)) ||
  (process.env.DATABASE_URL && /:\/\/db[:/]/.test(process.env.DATABASE_URL)) ||
  (process.env.REDIS_URL && /redis:\/\/redis[:/]/.test(process.env.REDIS_URL));

if (runningOnLocalhost && usesDockerNetworkValues) {
  const message =
    `Refusing to load ${envFileLabel} because it points to Docker network services. Set ENV_FILE=./.env.host for local development.`;
  console.error(message);
  throw new Error(message);
}

const missingEnvVars = [];

if (!process.env.DATABASE_URL) {
  missingEnvVars.push("DATABASE_URL");
}

if (!process.env.REDIS_URL) {
  missingEnvVars.push("REDIS_URL");
}

if (missingEnvVars.length) {
  const advice =
    "Define MEDUSA_ENV=host to load apps/backend/.env.host or set ENV_FILE to point at the right file.";
  const message = `Missing ${missingEnvVars.join(", ")} after loading ${envFileLabel}. ${advice}`;
  console.error(message);
  throw new Error(message);
}

const {
  DATABASE_URL,
  REDIS_URL,
  STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET,
  STORE_CORS = "*",
  ADMIN_CORS = "*",
  JWT_SECRET = "supersecret",
  COOKIE_SECRET = "supersecret",
} = process.env;

const redisEnabled = Boolean(REDIS_URL);

const modules = {
  [Modules.AUTH]: {
    resolve: "@medusajs/medusa/auth",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
      providers: [
        {
          resolve: "@medusajs/auth-emailpass",
          id: "emailpass",
          options: {
            secret: JWT_SECRET,
          },
        },
      ],
    },
  },
  [Modules.CUSTOMER]: {
    resolve: "@medusajs/medusa/customer",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.USER]: {
    resolve: "@medusajs/medusa/user",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.API_KEY]: {
    resolve: "@medusajs/medusa/api-key",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.CACHE]: {
    resolve: redisEnabled ? "@medusajs/medusa/cache-redis" : "@medusajs/medusa/cache-inmemory",
    options: redisEnabled ? { redisUrl: REDIS_URL } : {},
  },
  [Modules.EVENT_BUS]: {
    resolve: redisEnabled ? "@medusajs/medusa/event-bus-redis" : "@medusajs/medusa/event-bus-local",
    options: redisEnabled ? { redisUrl: REDIS_URL } : {},
  },
  [Modules.WORKFLOW_ENGINE]: {
    resolve: redisEnabled
      ? "@medusajs/medusa/workflow-engine-redis"
      : "@medusajs/medusa/workflow-engine-inmemory",
    options: redisEnabled ? { redis: { url: REDIS_URL } } : {},
  },
  [Modules.PRODUCT]: {
    resolve: "@medusajs/medusa/product",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.PRICING]: {
    resolve: "@medusajs/medusa/pricing",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.CART]: {
    resolve: "@medusajs/medusa/cart",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
      redisUrl: REDIS_URL,
    },
  },
  [Modules.ORDER]: {
    resolve: "@medusajs/medusa/order",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.REGION]: {
    resolve: "@medusajs/medusa/region",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.INVENTORY]: {
    resolve: "@medusajs/medusa/inventory",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.FULFILLMENT]: {
    resolve: "@medusajs/medusa/fulfillment",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.PAYMENT]: {
    resolve: "@medusajs/medusa/payment",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
  [Modules.PROMOTION]: {
    resolve: "@medusajs/medusa/promotion",
    options: {
      database: {
        clientUrl: DATABASE_URL,
      },
    },
  },
};

const plugins = ["@medusajs/medusa"];

if (STRIPE_SECRET_KEY) {
  const stripeOptions = {
    apiKey: STRIPE_SECRET_KEY,
  };

  if (STRIPE_WEBHOOK_SECRET) {
    stripeOptions.webhookSecret = STRIPE_WEBHOOK_SECRET;
  }

  plugins.push({
    resolve: "@medusajs/payment-stripe",
    options: stripeOptions,
  });
} else {
  console.warn(
    "STRIPE_SECRET_KEY is not set. The Stripe payment plugin will not be initialized."
  );
}

plugins.push(
  {
    resolve: path.join(__dirname, "src/plugins/shipping"),
    options: {},
  },
  {
    resolve: path.join(__dirname, "src/plugins/mock-webhook"),
    options: {},
  }
);

const config = {
  projectConfig: {
    redis_url: REDIS_URL,
    database_url: DATABASE_URL,
    database_type: "postgres",
    store_cors: STORE_CORS,
    admin_cors: ADMIN_CORS,
    jwt_secret: JWT_SECRET,
    cookie_secret: COOKIE_SECRET,
    query_limit: 50,
    database_logging: true,
  },
  modules,
  plugins,
};

export default config;
