export type Effort = "low" | "medium" | "high";

const BUDGET_MAP: Record<Effort, number> = {
  low: 1024,
  medium: 4096,
  high: 16384,
};

export function effortToBudgetTokens(effort: Effort): number {
  return BUDGET_MAP[effort];
}
