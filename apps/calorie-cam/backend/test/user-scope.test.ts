import assert from "node:assert/strict";
import test from "node:test";
import { getRequiredUserId } from "../src/utils/userScope";

const validUserId = "11111111-1111-4111-8111-111111111111";

test("getRequiredUserId reads a valid device user id from request body", () => {
  assert.equal(getRequiredUserId({ body: { userId: validUserId } }), validUserId);
});

test("getRequiredUserId reads a valid device user id from query params", () => {
  assert.equal(getRequiredUserId({ query: { userId: validUserId } }), validUserId);
});

test("getRequiredUserId rejects missing or invalid device user ids", () => {
  assert.throws(() => getRequiredUserId({ body: {} }), /userId is required/);
  assert.throws(
    () => getRequiredUserId({ body: { userId: "not-a-uuid" } }),
    /valid UUID/,
  );
});
