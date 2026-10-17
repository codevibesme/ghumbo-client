"use client";

import { LucideProvider } from "lucide-react";
import type { ReactNode } from "react";

/** App-wide client context. Icons: Lucide geometry at the system's 1.75 stroke. */
export function Providers({ children }: { children: ReactNode }) {
  return <LucideProvider strokeWidth={1.75}>{children}</LucideProvider>;
}
