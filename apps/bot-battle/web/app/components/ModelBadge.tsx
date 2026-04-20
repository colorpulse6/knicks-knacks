import React from "react";

type Status = "current" | "legacy" | "preview";
type ModelType = "standard" | "reasoning";

interface ModelBadgeProps {
  status?: Status;
  modelType?: ModelType;
}

const PILL_BASE = "inline-block text-[10px] font-semibold uppercase tracking-wide rounded-sm px-2 py-0.5 ml-1.5";

export const ModelBadge: React.FC<ModelBadgeProps> = ({ status, modelType }) => {
  const pills: React.ReactNode[] = [];
  if (modelType === "reasoning") {
    pills.push(
      <span key="r" data-badge="reasoning" className={`${PILL_BASE} bg-rust text-paper`}>REASONING</span>
    );
  }
  if (status === "legacy") {
    pills.push(
      <span key="l" data-badge="legacy" className={`${PILL_BASE} border border-ink-soft text-ink-soft`}>LEGACY</span>
    );
  }
  if (status === "preview") {
    pills.push(
      <span key="p" data-badge="preview" className={`${PILL_BASE} border border-rust text-rust`}>PREVIEW</span>
    );
  }
  if (pills.length === 0) return null;
  return <>{pills}</>;
};
