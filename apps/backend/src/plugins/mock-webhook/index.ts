import { Router } from "express";
import { MedusaRequest, MedusaResponse } from "@medusajs/medusa";

export default async function mockWebhook() {
  const router = Router();

  router.post("/hooks/test", (req: MedusaRequest, res: MedusaResponse) => {
    const payload = req.body ?? {};
    return res.status(200).json({ received: true, payload });
  });

  router.get("/hooks/test", (_req: MedusaRequest, res: MedusaResponse) => {
    res.json({ message: "Webhook healthcheck" });
  });

  return {
    resolve: "mock-webhook-plugin",
    routers: [
      {
        type: "admin",
        route: "",
        router,
      },
      {
        type: "store",
        route: "",
        router,
      },
    ],
    services: [],
  };
}
