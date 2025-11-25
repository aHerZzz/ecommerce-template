import fs from "fs";
import path from "path";
import type { MedusaContainer } from "@medusajs/framework/types";

export default async function seed({ container, args }: { container: MedusaContainer; args: string[] }) {
  const logger = container.resolve("logger") as { info: (msg: string) => void; warn: (msg: string) => void };
  const seedPath = args[0] ?? "./data/seed.json";
  const absolutePath = path.resolve(process.cwd(), seedPath);

  if (!fs.existsSync(absolutePath)) {
    logger.warn(`Seed file not found at ${absolutePath}. Skipping seeding.`);
    return;
  }

  logger.info(`Loaded seed descriptor from ${absolutePath}.`);
  const contents = fs.readFileSync(absolutePath, "utf-8");
  const payload = JSON.parse(contents);

  logger.info(
    `Medusa CLI v2 no longer offers built-in JSON seeding. Provide a custom seeding implementation here to persist ${payload.products?.length ?? 0} products and related resources.`
  );
}
