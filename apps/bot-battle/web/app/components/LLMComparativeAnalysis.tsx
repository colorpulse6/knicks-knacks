"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import * as Dialog from "@radix-ui/react-dialog";
import remarkGfm from "remark-gfm";
import { Medal, Trophy, Award, Star, X } from "lucide-react";

interface LLMComparativeAnalysisProps {
  results: { model: string; response: string | React.ReactNode }[];
  analysis: string | null;
  isLoading: boolean;
  error?: string;
  onRunAnalysis: () => void;
  open: boolean;
  onClose: () => void;
}

export const LLMComparativeAnalysis: React.FC<LLMComparativeAnalysisProps> = ({
  results,
  analysis,
  isLoading,
  error,
  onRunAnalysis,
  open,
  onClose,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
          bg-paper rounded-lg shadow-lg p-6 w-full max-w-2xl
          max-h-[90vh] overflow-y-auto z-50 focus:outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="font-bold text-lg">
              Comparative Analysis
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="absolute top-4 right-4 p-1 rounded-md hover:bg-paper-sunk"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </Dialog.Close>
          </div>

          <div className="text-xs text-ink-soft mb-4">
            We will compare and critique all LLM responses for this prompt,
            highlighting strengths and weaknesses.
          </div>

          {error ? (
            <div className="text-red-500 p-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              {error}
            </div>
          ) : isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 w-1/2 bg-paper-sunk rounded"></div>
              <div className="space-y-2">
                <div className="h-4 bg-paper-sunk rounded w-full"></div>
                <div className="h-4 bg-paper-sunk rounded w-5/6"></div>
                <div className="h-4 bg-paper-sunk rounded w-4/6"></div>
              </div>
              <div className="h-6 w-1/3 bg-paper-sunk rounded mt-6"></div>
              <div className="space-y-2">
                <div className="h-4 bg-paper-sunk rounded w-full"></div>
                <div className="h-4 bg-paper-sunk rounded w-5/6"></div>
              </div>
            </div>
          ) : analysis ? (
            <div className="prose dark:prose-invert max-w-none space-y-6">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-lg font-semibold mt-6 mb-3 pb-2 border-b border-rule"
                      {...props}
                    />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="space-y-3 pl-5" {...props} />
                  ),
                  li: ({ children }) => {
                    const content = children?.toString() || "";
                    // Enhanced detection for the specific ranking format
                    const isFirstPlace =
                      /\*\*1\.\*\*|\*\*first\*\*|\*\*winner\*\*/i.test(content);
                    const isSecondPlace = /\*\*2\.\*\*|\*\*second\*\*/i.test(
                      content
                    );
                    const isThirdPlace = /\*\*3\.\*\*|\*\*third\*\*/i.test(
                      content
                    );

                    // Check for model ranking patterns like "**1.** **Model 2 (Gemini)**"
                    const modelRankMatch = content.match(
                      /\*\*(\d+)\.\*\* \*\*Model (\d+)/i
                    );
                    const rank = modelRankMatch
                      ? parseInt(modelRankMatch[1])
                      : null;

                    return (
                      <li className="flex items-start gap-2">
                        {rank === 1 || isFirstPlace ? (
                          <Trophy className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                        ) : rank === 2 || isSecondPlace ? (
                          <Medal className="h-5 w-5 text-ink-soft flex-shrink-0" />
                        ) : rank === 3 || isThirdPlace ? (
                          <Award className="h-5 w-5 text-amber-600 flex-shrink-0" />
                        ) : (
                          <Star className="h-5 w-5 text-ink-soft flex-shrink-0" />
                        )}
                        <span>{children}</span>
                      </li>
                    );
                  },
                  p: ({ node, ...props }) => (
                    <p className="my-3 leading-relaxed" {...props} />
                  ),
                }}
              >
                {
                  analysis
                    .replace(/\n\n\n+/g, "\n\n") // Reduce excessive newlines
                    .replace(/(## [^\n]+)\n(?!\n)/g, "$1\n\n") // Ensure headings have space after
                    .replace(/(\S)\n(\S)/g, "$1  \n$2") // Convert single newlines to double
                }
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-ink-soft italic">
              No comparative analysis yet.
            </div>
          )}

          <div className="mt-4 flex justify-end">
            <button
              className="px-3 py-1 text-sm rounded bg-primary text-white 
              hover:bg-primary-dark disabled:opacity-50"
              onClick={onRunAnalysis}
              disabled={isLoading || results.length < 2}
            >
              {isLoading ? "Analyzing..." : "Re-run Analysis"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
