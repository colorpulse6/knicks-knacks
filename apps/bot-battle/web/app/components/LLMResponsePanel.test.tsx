import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LLMResponsePanel } from "./LLMResponsePanel";

describe("LLMResponsePanel", () => {
  it("standard models: no tabs rendered", () => {
    render(<LLMResponsePanel model="gpt-5-mini" modelType="standard" response="hi" />);
    expect(screen.queryByRole("tab", { name: /thinking/i })).toBeNull();
  });

  it("reasoning models: tabs for Answer and Thinking", () => {
    render(
      <LLMResponsePanel
        model="o3"
        modelType="reasoning"
        response="the answer"
        thinking="step 1 step 2"
        metrics={{ reasoningTokens: 500, answerTokens: 20 }}
      />
    );
    expect(screen.getByRole("tab", { name: /answer/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /thinking/i })).toBeInTheDocument();
  });

  it("default tab is Answer; Thinking tab shows thinking on click", () => {
    render(
      <LLMResponsePanel
        model="o3" modelType="reasoning"
        response="the answer" thinking="internal scratch"
      />
    );
    expect(screen.getByText("the answer")).toBeVisible();
    fireEvent.click(screen.getByRole("tab", { name: /thinking/i }));
    expect(screen.getByText("internal scratch")).toBeVisible();
  });

  it("Thinking tab shows placeholder when thinking not provided", () => {
    render(
      <LLMResponsePanel
        model="deepseek-v3.2-speciale"
        modelType="reasoning"
        response="answer"
        metrics={{ reasoningTokens: 412 }}
      />
    );
    fireEvent.click(screen.getByRole("tab", { name: /thinking/i }));
    expect(screen.getByText(/not exposed/i)).toBeInTheDocument();
    expect(screen.getByText(/412 tokens used/i)).toBeInTheDocument();
  });

  it("hides effort selector when supportsReasoningEffort is false", () => {
    render(<LLMResponsePanel model="r1" modelType="reasoning" response="a" />);
    // No combobox should render because supportsReasoningEffort is undefined/false
    expect(screen.queryByRole("combobox")).toBeNull();
  });

  it("shows effort selector when supportsReasoningEffort is true", () => {
    render(
      <LLMResponsePanel
        model="o3"
        modelType="reasoning"
        supportsReasoningEffort
        effort="medium"
        onEffortChange={() => {}}
        response="a"
      />
    );
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });
});
