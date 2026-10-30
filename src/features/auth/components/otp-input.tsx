"use client";

import { useRef, type ClipboardEvent, type KeyboardEvent, type Ref } from "react";
import { cn } from "@/lib/cn";
import { fillDigits } from "../lib";

type OtpInputProps = {
  /** One string per box, "" when empty. */
  digits: string[];
  onChange: (digits: string[]) => void;
  invalid?: boolean;
  describedBy?: string;
  disabled?: boolean;
  /** The first box, so the form can focus it after a reset. */
  ref?: Ref<HTMLInputElement>;
};

/*
 * One box per digit: 52×60 (48×56 below 720px), mono 24. Typing moves on,
 * Backspace on an empty box steps back, arrows move between boxes, and a paste
 * or the OS's one-time-code fill spreads over the boxes. Empty boxes show a
 * short dashed rule.
 */
export function OtpInput({ digits, onChange, invalid, describedBy, disabled, ref }: OtpInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([]);

  function focus(i: number) {
    const el = boxes.current[i];
    el?.focus();
    el?.select();
  }

  function apply(at: number, input: string) {
    const result = fillDigits(digits, at, input);
    onChange(result.digits);
    focus(result.focus);
  }

  function onInput(at: number, value: string) {
    // Typing over a filled box gives two characters: keep the new one.
    const prev = digits[at];
    apply(at, prev && value.length === 2 ? value.replace(prev, "") : value);
  }

  function onPaste(at: number, event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    apply(at, event.clipboardData.getData("text"));
  }

  function onKeyDown(at: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[at] && at > 0) {
      event.preventDefault();
      onChange(digits.map((d, i) => (i === at - 1 ? "" : d)));
      focus(at - 1);
    } else if (event.key === "ArrowLeft" && at > 0) {
      event.preventDefault();
      focus(at - 1);
    } else if (event.key === "ArrowRight" && at < digits.length - 1) {
      event.preventDefault();
      focus(at + 1);
    }
  }

  return (
    <div className="flex gap-1.5 md:gap-2">
      {digits.map((digit, i) => (
        // Boxes are positional and never reorder, so the index is their identity.
        // react-doctor-disable-next-line react-doctor/no-array-index-as-key
        <span key={i} className="relative block h-14 w-12 flex-none md:h-[60px] md:w-[52px]">
          <input
            ref={(el) => {
              boxes.current[i] = el;
              if (i === 0 && ref) {
                if (typeof ref === "function") ref(el);
                else ref.current = el;
              }
            }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            aria-label={`Digit ${i + 1} of ${digits.length}`}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            disabled={disabled}
            value={digit}
            onChange={(e) => onInput(i, e.target.value)}
            onPaste={(e) => onPaste(i, e)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "block size-full rounded-ticket border-[1.5px] border-line bg-card p-0 text-center",
              "font-mono text-[24px] font-semibold leading-none text-ink",
              "aria-invalid:border-2 aria-invalid:border-red disabled:bg-sunk disabled:text-muted",
            )}
          />
          {!digit && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-x-3.5 bottom-3 border-t-2 border-dashed border-tear"
            />
          )}
        </span>
      ))}
    </div>
  );
}
