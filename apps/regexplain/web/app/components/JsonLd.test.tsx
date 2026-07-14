import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import JsonLd from "./JsonLd";

describe("JsonLd", () => {
  it("escapes less-than characters in serialized data", () => {
    const { container } = render(
      <JsonLd data={{ value: "<script>alert('unsafe')</script>" }} />,
    );
    const script = container.querySelector("script");

    expect(script).toHaveAttribute("type", "application/ld+json");
    expect(script?.textContent).toContain("\\u003cscript>");
    expect(script?.textContent).not.toContain("<script>");
  });
});
