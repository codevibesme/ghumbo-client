import { Slot } from "radix-ui";
import type { ComponentProps } from "react";
import { type ButtonSize, type ButtonVariant, buttonClasses } from "./variants";

/*
 * One primary per view. "→" only on forward-moving primary actions, never on
 * secondary / destructive / submit-in-place. Styles live in ./variants.
 */

type ButtonProps = ComponentProps<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  /** Render the child element (e.g. next/link <Link>) with button styles. */
  asChild?: boolean;
};

export function Button({
  variant,
  size,
  fullWidth,
  asChild,
  className,
  type,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      type={asChild ? undefined : (type ?? "button")}
      className={buttonClasses({ variant, size, fullWidth, className })}
      {...props}
    />
  );
}
