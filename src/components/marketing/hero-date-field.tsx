"use client";

import { useRef, useState } from "react";
import { CalendarDays } from "lucide-react";

interface HeroDateFieldProps {
  label: string;
  name: string;
  id: string;
}

/**
 * Native date inputs cannot show a placeholder, so the landing hero renders a
 * friendly trigger that opens the browser date picker and keeps the real input
 * in the form for submission.
 */
export function HeroDateField({ label, name, id }: HeroDateFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  function openPicker() {
    const input = inputRef.current;
    if (!input) return;
    if (typeof input.showPicker === "function") {
      input.showPicker();
    } else {
      input.focus();
    }
  }

  return (
    <div className="flex items-start gap-3">
      <CalendarDays className="text-brand-muted mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <label htmlFor={id} className="text-foreground block text-sm font-semibold">
          {label}
        </label>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="date"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="sr-only"
          aria-describedby={`${id}-display`}
        />
        <button
          type="button"
          id={`${id}-display`}
          onClick={openPicker}
          className="text-brand-muted hover:text-foreground mt-0.5 block text-sm transition-colors"
        >
          {value
            ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Choose a date"}
        </button>
      </div>
    </div>
  );
}
