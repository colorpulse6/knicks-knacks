"use client";

import { ReactNode } from "react";
import { ApiKeyProvider } from "../providers/ApiKeyProvider";

interface ClientWrapperProps {
  children: ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return <ApiKeyProvider>{children}</ApiKeyProvider>;
}
