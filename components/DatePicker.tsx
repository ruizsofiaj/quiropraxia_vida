"use client";

import { useState } from "react";
import { addMonths, monthLabel, monthWeeks, WEEK_HEADERS } from "@/lib/calendar";
import { addDays, dowOf, fmtDateStrLong } from "@/lib/time";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

type Props = {
  today: string; // YYYY-MM-DD
  maxDays: number;
  openDows: number[];
  value: string;
  onChange: (date: string) => void;
};

// Calendario de mes normal: se ve el mes entero y se elige un día disponible.
export function DatePicker({ today, maxDays, openDows, value, onChange }: Props) {
  const last = addDays(today, maxDays);
  const firstMonth = today.slice(0, 7);
  const lastMonth = last.slice(0, 7);
  const [month, setMonth] = useState(firstMonth);
  const weeks = monthWeeks(month);

  const enabled = (d: string) => d >= today && d <= last && openDows.includes(dowOf(d));

  return (
    <div className="w-full max-w-md rounded-3xl border border-line bg-white p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, -1))}
          disabled={month <= firstMonth}
          aria-label="Mes anterior"
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-sea-soft disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <p className="font-serif text-lg font-semibold" aria-live="polite">
          {monthLabel(month)}
        </p>
        <button
          type="button"
          onClick={() => setMonth(addMonths(month, 1))}
          disabled={month >= lastMonth}
          aria-label="Mes siguiente"
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-sea-soft disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronRightIcon className="h-5 w-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="group" aria-label="Días disponibles">
        {WEEK_HEADERS.map((w, i) => (
          <span key={i} aria-label={w.long} className="py-1 text-xs font-semibold uppercase text-ink-soft">
            {w.short}
          </span>
        ))}
        {weeks.flat().map((d, i) => {
          if (!d) return <span key={`e${i}`} />;
          const ok = enabled(d);
          const selected = d === value;
          const isToday = d === today;
          return (
            <button
              key={d}
              type="button"
              disabled={!ok}
              aria-pressed={selected}
              aria-label={fmtDateStrLong(d)}
              onClick={() => onChange(d)}
              className={`relative grid aspect-square min-h-11 place-items-center rounded-full text-sm font-semibold transition-colors ${
                selected
                  ? "bg-sea text-white"
                  : ok
                    ? "hover:bg-sea-soft"
                    : "cursor-not-allowed text-ink-soft/40"
              }`}
            >
              {Number(d.slice(8))}
              {isToday && !selected && (
                <span aria-hidden className="absolute bottom-1.5 h-1 w-1 rounded-full bg-orange" />
              )}
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-ink-soft">Los días en gris no tienen atención.</p>
    </div>
  );
}
