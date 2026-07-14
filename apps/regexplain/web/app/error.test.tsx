import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import GlobalError from "./error";

describe("GlobalError", () => {
  it("keeps internal error details private while preserving recovery actions", async () => {
    const user = userEvent.setup();
    const reset = vi.fn();

    render(
      <GlobalError
        error={new Error("private stack or service detail")}
        reset={reset}
      />,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      "Terminal interrupted",
    );
    expect(
      screen.queryByText("private stack or service detail"),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Go back home" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
