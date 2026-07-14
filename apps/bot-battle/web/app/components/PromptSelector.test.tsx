import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PromptSelector } from "./PromptSelector";

describe("PromptSelector", () => {
  it("labels the prompt template control", () => {
    render(<PromptSelector value="" onChange={() => {}} />);

    expect(
      screen.getByRole("combobox", { name: /prompt template/i }),
    ).toBeInTheDocument();
  });
});
