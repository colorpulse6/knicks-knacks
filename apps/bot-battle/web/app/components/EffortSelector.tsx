import React from "react";

export type { Effort } from "../core/reasoning";
export { effortToBudgetTokens } from "../core/reasoning";

import type { Effort } from "../core/reasoning";

interface Props {
  value: Effort;
  onChange: (e: Effort) => void;
}

export const EffortSelector: React.FC<Props> = ({ value, onChange }) => (
  <label className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
    Effort:
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Effort)}
      className="text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-700"
    >
      <option value="low">low</option>
      <option value="medium">medium</option>
      <option value="high">high</option>
    </select>
  </label>
);
