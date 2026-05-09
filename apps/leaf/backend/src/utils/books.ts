import { z } from "zod";

export const BOOK_STATUSES = [
  "want_to_read",
  "reading",
  "finished",
  "paused",
] as const;

export type BookStatus = (typeof BOOK_STATUSES)[number];

export type BookUpdateInput = {
  status?: BookStatus;
  pages_read?: number;
  percent_complete?: number;
};

const uuidSchema = z.string().uuid("A valid id is required");
const statusSchema = z.enum(BOOK_STATUSES, {
  errorMap: () => ({ message: "Invalid book status" }),
});

const numberFromInput = (label: string, max?: number) => {
  let schema = z
    .number({ invalid_type_error: `Invalid ${label}` })
    .finite(`Invalid ${label}`)
    .int(`Invalid ${label}`)
    .min(0, `Invalid ${label}`);

  if (typeof max === "number") {
    schema = schema.max(max, `Invalid ${label}`);
  }

  return z.preprocess((value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(value);
    }

    return value;
  }, schema);
};

const BookProgressSchema = z.object({
  status: statusSchema.optional(),
  pages_read: numberFromInput("pages read").optional(),
  percent_complete: numberFromInput("percent complete", 100).optional(),
});

const bookFields = [
  "title",
  "subtitle",
  "author",
  "author_key",
  "description",
  "cover_url",
  "open_library_id",
  "isbn_10",
  "isbn_13",
  "publish_date",
  "publisher",
  "page_count",
  "subjects",
  "language",
  "series",
  "goodreads_id",
] as const;

function getProgressPayload(body: Record<string, unknown>) {
  return {
    status: body.status,
    pages_read: body.pages_read ?? body.pagesRead,
    percent_complete: body.percent_complete ?? body.percentComplete,
  };
}

export function parseBookUpdate(body: unknown): BookUpdateInput {
  const input = (body ?? {}) as Record<string, unknown>;
  const parsed = BookProgressSchema.safeParse(getProgressPayload(input));

  if (!parsed.success) {
    throw new Error(
      `Invalid book update: ${
        parsed.error.issues[0]?.message ?? "invalid payload"
      }`,
    );
  }

  const update = Object.fromEntries(
    Object.entries(parsed.data).filter(([, value]) => value !== undefined),
  ) as BookUpdateInput;

  if (Object.keys(update).length === 0) {
    throw new Error("At least one field is required to update a book");
  }

  return update;
}

export function normalizeBookInsert(body: unknown, userId: string) {
  const input = (body ?? {}) as Record<string, unknown>;
  const progress = BookProgressSchema.parse(getProgressPayload(input));
  const insertObj: Record<string, unknown> = {
    user_id: uuidSchema.parse(userId),
    status: progress.status ?? "want_to_read",
    pages_read: progress.pages_read ?? 0,
    percent_complete: progress.percent_complete ?? 0,
  };

  bookFields.forEach((field) => {
    if (input[field] !== undefined) {
      insertObj[field] = input[field];
    }
  });

  return insertObj as Record<string, unknown> & {
    user_id: string;
    status: BookStatus;
    pages_read: number;
    percent_complete: number;
  };
}

export function getScopedBookFilter(bookId: string, userId: string) {
  return {
    id: uuidSchema.parse(bookId),
    user_id: uuidSchema.parse(userId),
  };
}
