import { z } from "zod";

const DeviceUserIdSchema = z.string().uuid();

type RequestLike = {
  body?: Record<string, unknown>;
  query?: Record<string, unknown>;
  headers?: Record<string, unknown>;
};

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export function getRequiredUserId(req: RequestLike): string {
  const userId =
    firstString(req.body?.userId) ??
    firstString(req.body?.user_id) ??
    firstString(req.query?.userId) ??
    firstString(req.query?.user_id) ??
    firstString(req.headers?.["x-device-user-id"]);

  if (!userId) {
    throw new Error("userId is required");
  }

  const parsed = DeviceUserIdSchema.safeParse(userId);
  if (!parsed.success) {
    throw new Error("userId must be a valid UUID");
  }

  return parsed.data;
}
