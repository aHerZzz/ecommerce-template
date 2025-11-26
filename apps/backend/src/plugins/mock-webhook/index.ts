import type { Request, Response } from "express";
import { Router } from "express";

export default async function mockWebhook() {
  const router = Router();

  router.post("/hooks/test", (req: Request, res: Response) => {
    const payload = req.body ?? {};
    return res.status(200).json({ received: true, payload });
  });

  router.get("/hooks/test", (_req: Request, res: Response) => {
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
