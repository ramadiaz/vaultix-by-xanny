"use client";

import { StatPeriod } from "@/features/stats/utils/stats-utils";

type PeriodOption = {
  value: StatPeriod;
  label: string;
};

const PERIOD_OPTIONS: PeriodOption[] = [
  { value: "week", label: "Week" },
  { value: "month", label: "Month" },
  { value: "3months", label: "3 Months" },
  { value: "year", label: "Year" },
];

type PeriodSelectorProps = {
  value: StatPeriod;
  onChange: (period: StatPeriod) => void;
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="inline-flex min-w-full gap-1 rounded-2xl border border-white/10 bg-white/[0.04] p-1 backdrop-blur-sm">
        {PERIOD_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`min-h-[32px] min-w-[52px] flex-1 shrink-0 whitespace-nowrap rounded-xl px-2 py-1 text-xs font-semibold transition-all duration-200 active:scale-[0.98] ${
              value === opt.value
                ? "bg-white/90 text-slate-900 shadow-lg shadow-black/20"
                : "text-muted-soft hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
