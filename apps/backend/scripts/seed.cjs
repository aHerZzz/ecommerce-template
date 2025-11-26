const fs = require("fs");
const path = require("path");
const { ContainerRegistrationKeys, Modules } = require("@medusajs/utils");

const resolveLogger = (container) => {
  try {
    return container.resolve(ContainerRegistrationKeys.LOGGER);
  } catch (_) {
    return console;
  }
};

const maybeResolve = (container, key) => {
  try {
    return container.resolve(key);
  } catch (_) {
    return null;
  }
};

/**
 * @param {{ container: import("@medusajs/framework/types").MedusaContainer; args: string[] }} context
 */
const seed = async function seed({ container, args }) {
  const logger = resolveLogger(container);
  const seedPath = args[0] ?? "./data/seed.json";
  const absolutePath = path.resolve(process.cwd(), seedPath);

  if (!fs.existsSync(absolutePath)) {
    logger.warn(`Seed file not found at ${absolutePath}. Skipping seeding.`);
    return;
  }

  const contents = fs.readFileSync(absolutePath, "utf-8");
  const payload = JSON.parse(contents);
  logger.info(`Seeding Medusa 2 data from ${absolutePath}.`);

  const regionService = maybeResolve(container, Modules.REGION);
  const productService = maybeResolve(container, Modules.PRODUCT);
  const promotionService = maybeResolve(container, Modules.PROMOTION);
  const fulfillmentService = maybeResolve(container, Modules.FULFILLMENT);

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

  const regions = regionService ? await regionService.listRegions() : [];

  if (fulfillmentService && payload.shipping_options?.length) {
    const shippingProfile = await fulfillmentService.upsertShippingProfiles({
      name: "Default Shipping Profile",
      type: "default",
    });

    const providers = await fulfillmentService.listFulfillmentProviders();
    const providerIds = new Set(providers.map((provider) => provider.id));
    const serviceZonesByRegion = new Map();

    for (const regionName of new Set(payload.shipping_options.map((s) => s.region_name))) {
      const region = regions.find((r) => r.name === regionName);
      if (!region) {
        logger.warn(`Region '${regionName}' not found; skipping related shipping options.`);
        continue;
      }

      const [existingSet] = await fulfillmentService.listFulfillmentSets(
        { name: `${region.name} Shipping` },
        { relations: ["service_zones"] }
      );

      const geoZones = (region.countries || []).map(({ iso_2 }) => ({
        type: "country",
        country_code: iso_2,
      }));

      const fulfillmentSet =
        existingSet ??
        (await fulfillmentService.createFulfillmentSets({
          name: `${region.name} Shipping`,
          type: "default",
          service_zones: [
            {
              name: `${region.name} Service Zone`,
              geo_zones: geoZones,
            },
          ],
        }));

      const currentServiceZone = fulfillmentSet.service_zones?.[0];

      const serviceZone = currentServiceZone
        ? await fulfillmentService.updateServiceZones(currentServiceZone.id, {
            name: `${region.name} Service Zone`,
            geo_zones: geoZones,
          })
        : await fulfillmentService.createServiceZones({
            name: `${region.name} Service Zone`,
            fulfillment_set_id: fulfillmentSet.id,
            geo_zones: geoZones,
          });

      serviceZonesByRegion.set(region.name, serviceZone.id);
    }

    const shippingOptions = payload.shipping_options
      .map((option) => {
        const service_zone_id = serviceZonesByRegion.get(option.region_name);

        if (!service_zone_id) {
          return null;
        }

        if (!providerIds.has(option.provider_id)) {
          logger.warn(
            `Provider '${option.provider_id}' not found; skipping shipping option '${option.name}'.`
          );
          return null;
        }

        const code = option.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        return {
          name: option.name,
          price_type: option.price_type ?? "flat",
          service_zone_id,
          shipping_profile_id: shippingProfile.id,
          provider_id: option.provider_id,
          type: {
            label: option.name,
            description: option.name,
            code,
          },
          data: {
            amount: option.amount,
            admin_only: option.admin_only ?? false,
            requirements: option.requirements ?? [],
            ...(option.data || {}),
          },
        };
      })
      .filter(Boolean);

    if (shippingOptions.length) {
      await fulfillmentService.upsertShippingOptions(shippingOptions);
      logger.info(`Upserted ${shippingOptions.length} shipping option(s).`);
    } else {
      logger.info("No shipping options to upsert after validation.");
    }
  } else if (!fulfillmentService && payload.shipping_options?.length) {
    logger.warn("Fulfillment module is not registered; skipping shipping options.");
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
      variants: product.variants?.map((variant) => ({
        title: variant.title,
        options: variant.options,
        prices: variant.prices?.map((price) => ({
          amount: price.amount,
          currency_code: price.currency_code,
          min_quantity: price.min_quantity,
          max_quantity: price.max_quantity,
          region_id: price.region_id,
        })),
      })),
      categories: product.categories,
    }));

    await productService.upsertProducts(products);
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
};

module.exports = seed;
module.exports.default = seed;
