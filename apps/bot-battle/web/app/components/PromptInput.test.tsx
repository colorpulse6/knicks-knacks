import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptInput } from "./PromptInput";

describe("PromptInput", () => {
  it("labels the benchmark prompt", () => {
    render(<PromptInput value="" onChange={() => {}} />);

    expect(
      screen.getByRole("textbox", { name: "Prompt" }),
    ).toBeInTheDocument();
  });
});
