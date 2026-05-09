import assert from "node:assert/strict";
import test from "node:test";
import {
  getScopedFoodLogFilter,
  parseFoodLogUpdate,
  withSignedImageUrls,
} from "../src/utils/foodLogs";

test("withSignedImageUrls replaces stored image paths with signed image URLs", async () => {
  const logs = [
    {
      id: "log-1",
      user_id: "user-1",
      image_url: "user-1/food_image_1.jpg",
      image_path: "user-1/food_image_1.jpg",
      food_name: "Avocado toast",
      calories: 420,
      proteins: 14,
      fats: 24,
      carbs: 38,
      logged_at: "2026-05-09T10:00:00.000Z",
    },
  ];

  const signedLogs = await withSignedImageUrls(logs, async (path: string) => {
    return `https://signed.example/${path}`;
  });

  assert.equal(
    signedLogs[0].image_url,
    "https://signed.example/user-1/food_image_1.jpg",
  );
  assert.equal(signedLogs[0].image_path, "user-1/food_image_1.jpg");
});

test("withSignedImageUrls preserves legacy image URLs when no path is stored", async () => {
  const logs = [
    {
      id: "log-2",
      user_id: "user-1",
      image_url: "https://public.example/legacy.jpg",
      image_path: null,
      food_name: "Legacy meal",
      calories: 650,
      proteins: 30,
      fats: 22,
      carbs: 80,
      logged_at: "2026-05-09T11:00:00.000Z",
    },
  ];

  const signedLogs = await withSignedImageUrls(logs, async () => {
    throw new Error("signer should not be called for legacy rows");
  });

  assert.equal(signedLogs[0].image_url, "https://public.example/legacy.jpg");
});

test("parseFoodLogUpdate accepts editable nutrition fields", () => {
  assert.deepEqual(
    parseFoodLogUpdate({
      foodName: "Chicken bowl",
      calories: 520,
      proteins: 42.5,
      fats: 18,
      carbs: 47,
    }),
    {
      food_name: "Chicken bowl",
      calories: 520,
      proteins: 42.5,
      fats: 18,
      carbs: 47,
    },
  );
});

test("parseFoodLogUpdate rejects empty or invalid update payloads", () => {
  assert.throws(() => parseFoodLogUpdate({}), /at least one field/i);
  assert.throws(() => parseFoodLogUpdate({ calories: -1 }), /invalid/i);
  assert.throws(() => parseFoodLogUpdate({ foodName: "" }), /invalid/i);
});

test("getScopedFoodLogFilter requires a valid log id and device user id", () => {
  const logId = "22222222-2222-4222-8222-222222222222";
  const userId = "11111111-1111-4111-8111-111111111111";

  assert.deepEqual(getScopedFoodLogFilter(logId, userId), {
    id: logId,
    user_id: userId,
  });
  assert.throws(() => getScopedFoodLogFilter("not-a-uuid", userId), /valid/i);
});
