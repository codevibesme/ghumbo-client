import { createContext, useContext } from "react";

export type FieldCtx = { id: string; describedBy?: string; invalid: boolean };
export const FieldContext = createContext<FieldCtx | null>(null);

/** id + aria wiring from the surrounding <Field>, if any. */
export function useFieldControl(id?: string) {
  const ctx = useContext(FieldContext);
  return {
    id: id ?? ctx?.id,
    "aria-describedby": ctx?.describedBy,
    "aria-invalid": ctx?.invalid || undefined,
  };
}
