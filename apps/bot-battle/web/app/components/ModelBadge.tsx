import React from "react";

type Status = "current" | "legacy" | "preview";
type ModelType = "standard" | "reasoning";

interface ModelBadgeProps {
  status?: Status;
  modelType?: ModelType;
}

const PILL = "inline-block text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ml-1.5";

export const ModelBadge: React.FC<ModelBadgeProps> = ({ status, modelType }) => {
  const pills: React.ReactNode[] = [];
  if (modelType === "reasoning") {
    pills.push(<span key="r" data-badge="reasoning" className={`${PILL} bg-purple-600 text-white`}>REASONING</span>);
  }
  if (status === "legacy") {
    pills.push(<span key="l" data-badge="legacy" className={`${PILL} bg-gray-400 text-white`}>LEGACY</span>);
  }
  if (status === "preview") {
    pills.push(<span key="p" data-badge="preview" className={`${PILL} bg-amber-500 text-white`}>PREVIEW</span>);
  }
  if (pills.length === 0) return null;
  return <>{pills}</>;
};
