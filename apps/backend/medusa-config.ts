import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: process.env.MEDUSA_ENV ? `.env.${process.env.MEDUSA_ENV}` : path.join(process.cwd(), ".env") });

type Config = {
  projectConfig: Record<string, unknown>;
  plugins: Array<string | { resolve: string; options?: Record<string, unknown> }>;
};

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

const plugins: Config["plugins"] = ["@medusajs/medusa"];

if (STRIPE_SECRET_KEY) {
  const stripeOptions: Record<string, unknown> = {
    api_key: STRIPE_SECRET_KEY,
  };

  if (STRIPE_WEBHOOK_SECRET) {
    stripeOptions.webhook_secret = STRIPE_WEBHOOK_SECRET;
  }

  plugins.push({
    resolve: "@medusajs/medusa-payment-stripe",
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

const config: Config = {
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
  plugins,
};

export default config;
