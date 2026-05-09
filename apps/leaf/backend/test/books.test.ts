import assert from "node:assert/strict";
import test from "node:test";
import {
  getScopedBookFilter,
  normalizeBookInsert,
  parseBookUpdate,
} from "../src/utils/books";

const userId = "11111111-1111-4111-8111-111111111111";
const bookId = "22222222-2222-4222-8222-222222222222";

test("normalizeBookInsert defaults new books to want_to_read with empty progress", () => {
  const insert = normalizeBookInsert(
    {
      id: "client-generated-id",
      title: "Dune",
      author: "Frank Herbert",
    },
    userId,
  );

  assert.equal(insert.user_id, userId);
  assert.equal(insert.title, "Dune");
  assert.equal(insert.status, "want_to_read");
  assert.equal(insert.pages_read, 0);
  assert.equal(insert.percent_complete, 0);
  assert.equal("id" in insert, false);
});

test("normalizeBookInsert accepts valid initial reading progress", () => {
  const insert = normalizeBookInsert(
    {
      title: "The Left Hand of Darkness",
      status: "reading",
      pagesRead: 42,
      percentComplete: 18,
    },
    userId,
  );

  assert.equal(insert.status, "reading");
  assert.equal(insert.pages_read, 42);
  assert.equal(insert.percent_complete, 18);
});

test("parseBookUpdate accepts status and progress fields", () => {
  assert.deepEqual(
    parseBookUpdate({
      status: "finished",
      pagesRead: 320,
      percentComplete: 100,
    }),
    {
      status: "finished",
      pages_read: 320,
      percent_complete: 100,
    },
  );
});

test("parseBookUpdate rejects empty, invalid status, or impossible progress", () => {
  assert.throws(() => parseBookUpdate({}), /at least one field/i);
  assert.throws(() => parseBookUpdate({ status: "done" }), /invalid/i);
  assert.throws(() => parseBookUpdate({ pagesRead: -1 }), /invalid/i);
  assert.throws(() => parseBookUpdate({ percentComplete: 101 }), /invalid/i);
});

test("getScopedBookFilter requires a valid book id and device user id", () => {
  assert.deepEqual(getScopedBookFilter(bookId, userId), {
    id: bookId,
    user_id: userId,
  });
  assert.throws(() => getScopedBookFilter("not-a-uuid", userId), /valid/i);
});
