import { Router } from "express";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

const SHIPPING_METHODS = [
  {
    id: "standard-shipping",
    name: "Envío estándar",
    price: 800,
    requirements: [{ type: "min_subtotal", amount: 0 }],
    admin_only: false,
    is_return: false,
  },
  {
    id: "pickup",
    name: "Recogida en tienda",
    price: 0,
    requirements: [{ type: "min_subtotal", amount: 0 }],
    admin_only: false,
    is_return: false,
  },
];

export default async function shippingPlugin() {
  const router = Router();

  router.get("/store/shipping-options", (req: MedusaRequest, res: MedusaResponse) => {
    res.json({ shipping_options: SHIPPING_METHODS });
  });

  router.get("/store/shipping-options/:id", (req: MedusaRequest, res: MedusaResponse) => {
    const method = SHIPPING_METHODS.find((m) => m.id === req.params.id);
    if (!method) {
      return res.status(404).json({ message: "Shipping method not found" });
    }

    res.json({ shipping_option: method });
  });

  return {
    resolve: "shipping-plugin",
    routers: [
      {
        type: "store",
        route: "",
        router,
      },
    ],
    services: [],
  };
}
