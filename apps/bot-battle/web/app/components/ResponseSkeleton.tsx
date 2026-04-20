import React from "react";

const BAR_BASE =
  "h-[10px] rounded-sm bg-gradient-to-r from-rule-soft via-paper to-rule-soft bg-[length:200px_100%] animate-[shimmer_1.2s_linear_infinite]";

export const ResponseSkeleton: React.FC = () => (
  <div role="status" aria-label="Loading response" className="space-y-2 py-1">
    <div data-skeleton-bar className={BAR_BASE} style={{ width: "95%" }} />
    <div data-skeleton-bar className={BAR_BASE} style={{ width: "87%" }} />
    <div data-skeleton-bar className={BAR_BASE} style={{ width: "72%" }} />
  </div>
);
