import { z } from "zod";

export type FoodLogRow = {
  id: string;
  user_id: string;
  image_url: string | null;
  image_path?: string | null;
  food_name: string | null;
  calories: number | null;
  proteins: number | null;
  fats: number | null;
  carbs: number | null;
  logged_at: string;
};

export type FoodLogUpdateInput = {
  food_name?: string;
  calories?: number;
  proteins?: number;
  fats?: number;
  carbs?: number;
};

type SignedUrlFactory = (path: string) => Promise<string | null>;

const numberFromInput = (label: string, integer = false) => {
  const numberSchema = z
    .number({ invalid_type_error: `Invalid ${label}` })
    .finite(`Invalid ${label}`)
    .min(0, `Invalid ${label}`);

  return z.preprocess(
    (value) => {
      if (typeof value === "string" && value.trim() !== "") {
        return Number(value);
      }

      return value;
    },
    integer ? numberSchema.int(`Invalid ${label}`) : numberSchema,
  );
};

const FoodLogUpdateSchema = z.object({
  food_name: z.string().trim().min(1, "Invalid food name").max(120).optional(),
  calories: numberFromInput("calories", true).optional(),
  proteins: numberFromInput("proteins").optional(),
  fats: numberFromInput("fats").optional(),
  carbs: numberFromInput("carbs").optional(),
});

const FoodLogIdSchema = z.string().uuid("A valid food log id is required");

export function parseFoodLogUpdate(body: unknown): FoodLogUpdateInput {
  const input = (body ?? {}) as Record<string, unknown>;
  const payload = {
    food_name: input.food_name ?? input.foodName,
    calories: input.calories,
    proteins: input.proteins,
    fats: input.fats,
    carbs: input.carbs,
  };

  const parsed = FoodLogUpdateSchema.safeParse(payload);

  if (!parsed.success) {
    throw new Error(
      `Invalid food log update: ${
        parsed.error.issues[0]?.message ?? "invalid payload"
      }`,
    );
  }

  const update = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  ) as FoodLogUpdateInput;

  if (Object.keys(update).length === 0) {
    throw new Error("At least one field is required to update a food log");
  }

  return update;
}

export async function withSignedImageUrls<T extends FoodLogRow>(
  logs: T[],
  createSignedUrl: SignedUrlFactory,
): Promise<T[]> {
  return Promise.all(
    logs.map(async (log) => {
      if (!log.image_path) {
        return { ...log };
      }

      const signedUrl = await createSignedUrl(log.image_path);
      return {
        ...log,
        image_url: signedUrl ?? log.image_url,
      };
    }),
  );
}

export function getScopedFoodLogFilter(logId: string, userId: string) {
  return {
    id: FoodLogIdSchema.parse(logId),
    user_id: userId,
  };
}
