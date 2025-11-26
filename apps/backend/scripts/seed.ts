import fs from "fs";
import path from "path";
import type {
  IProductModuleService,
  IPromotionModuleService,
  IRegionModuleService,
} from "@medusajs/types";
import type { MedusaContainer } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/utils";

type SeedFile = {
  regions?: Array<{
    name: string;
    currency_code: string;
    countries?: string[];
    payment_providers?: string[];
  }>;
  product_categories?: Array<{ name: string; handle?: string }>;
  products?: Array<{
    title: string;
    subtitle?: string;
    description?: string;
    handle?: string;
    collection_handle?: string;
    tags?: string[];
    images?: string[];
    options?: Array<{ title: string; values: string[] }>;
    variants?: Array<{
      title: string;
      options?: Record<string, string>;
    }>;
    categories?: string[];
  }>;
  discounts?: Array<{
    code: string;
    rule?: { type: string; value: number; allocation?: string };
    regions?: string[];
    is_disabled?: boolean;
  }>;
};

const resolveLogger = (
  container: MedusaContainer
): { info: (msg: string) => void; warn: (msg: string) => void } => {
  try {
    return container.resolve(ContainerRegistrationKeys.LOGGER);
  } catch (e) {
    return console as unknown as { info: (msg: string) => void; warn: (msg: string) => void };
  }
};

const maybeResolve = <T>(container: MedusaContainer, key: string): T | null => {
  try {
    return container.resolve<T>(key);
  } catch (e) {
    return null;
  }
};

export default async function seed({ container, args }: { container: MedusaContainer; args: string[] }) {
  const logger = resolveLogger(container);
  const seedPath = args[0] ?? "./data/seed.json";
  const absolutePath = path.resolve(process.cwd(), seedPath);

  if (!fs.existsSync(absolutePath)) {
    logger.warn(`Seed file not found at ${absolutePath}. Skipping seeding.`);
    return;
  }

  const contents = fs.readFileSync(absolutePath, "utf-8");
  const payload = JSON.parse(contents) as SeedFile;
  logger.info(`Seeding Medusa 2 data from ${absolutePath}.`);

  const regionService = maybeResolve<IRegionModuleService>(container, Modules.REGION);
  const productService = maybeResolve<IProductModuleService>(container, Modules.PRODUCT);
  const promotionService = maybeResolve<IPromotionModuleService>(container, Modules.PROMOTION);

  if (regionService && payload.regions?.length) {
    await regionService.upsertRegions(
      payload.regions.map((region) => ({
        name: region.name,
        currency_code: region.currency_code,
        countries: region.countries,
        payment_providers: region.payment_providers,
      }))
    );
    logger.info(`Upserted ${payload.regions.length} region(s).`);
  } else if (!regionService) {
    logger.warn("Region module is not registered; skipping region creation.");
  }

  if (productService && payload.product_categories?.length) {
    await productService.upsertProductCategories(
      payload.product_categories.map((category) => ({
        name: category.name,
        handle: category.handle,
      }))
    );
    logger.info(`Upserted ${payload.product_categories.length} product categories.`);
  }

  if (productService && payload.products?.length) {
    const products = payload.products.map((product) => ({
      title: product.title,
      subtitle: product.subtitle,
      description: product.description,
      handle: product.handle,
      collection: product.collection_handle
        ? { title: product.collection_handle, handle: product.collection_handle }
        : undefined,
      tags: product.tags?.map((value) => ({ value })),
      images: product.images?.map((url) => ({ url })),
      options: product.options?.map((option) => ({ title: option.title, values: option.values })),
      variants: product.variants?.map((variant) => ({ title: variant.title, options: variant.options })),
      categories: product.categories,
    }));

    await productService.upsertProducts(products as any);
    logger.info(`Upserted ${products.length} product(s).`);
  }

  if (promotionService && payload.discounts?.length) {
    await promotionService.createPromotions(
      payload.discounts.map((discount) => ({
        code: discount.code,
        is_disabled: discount.is_disabled ?? false,
        status: "active",
        type: "standard",
        application_method: {
          allocation: discount.rule?.allocation === "total" ? "across" : "each",
          value: discount.rule?.type === "percentage" ? discount.rule?.value : discount.rule?.value ?? 0,
          max_quantity: null,
          type: discount.rule?.type === "percentage" ? "percentage" : "fixed",
          target_type: discount.rule?.type === "free_shipping" ? "shipping_methods" : "order",
          buy_rules: [],
          target_rules: [],
        },
        currency_code:
          discount.rule?.type === "percentage"
            ? undefined
            : payload.regions?.find((region) => region.name === discount.regions?.[0])?.currency_code ||
              payload.regions?.[0]?.currency_code,
        regions: discount.regions,
      }))
    );
    logger.info(`Upserted ${payload.discounts.length} discount(s).`);
  } else if (!promotionService && payload.discounts?.length) {
    logger.warn("Promotion module is not registered; skipping discounts.");
  }

  logger.info("Seed script completed.");
}
