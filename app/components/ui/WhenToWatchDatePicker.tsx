"use client";

import {
  calendarCellKey,
  formatMatchDateDisplay,
  getMatchCalendarDates,
  type MatchCalendarDate,
  type MatchFixture,
} from "@/app/data/matches";
import { useTranslations } from "@/app/i18n/useTranslations";
import { useEffect, useMemo, useRef, useState } from "react";

const BRAND_RED = "#E31837";
const SELECTED_DAY_BG = "#DF2027";

const WEEKDAYS_EN = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"] as const;
const WEEKDAYS_AR = ["أح", "إث", "ث", "أر", "خ", "ج", "س"] as const;

type WhenToWatchDatePickerProps = {
  value: string;
  onChange: (dateLabel: string) => void;
  placeholder: string;
  fieldHeight: string;
  fieldFontSize: string;
  matches?: MatchFixture[];
};

type CalendarCell = {
  day: number;
  inMonth: boolean;
  dateLabel: string | null;
};

function buildMonthGrid(
  year: number,
  month: number,
  selectableByDay: Map<string, string>,
): CalendarCell[] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarCell[] = [];

  for (let i = 0; i < firstWeekday; i += 1) {
    cells.push({ day: 0, inMonth: false, dateLabel: null });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = calendarCellKey(year, month, day);
    cells.push({
      day,
      inMonth: true,
      dateLabel: selectableByDay.get(key) ?? null,
    });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ day: 0, inMonth: false, dateLabel: null });
  }

  return cells;
}

function monthHasSelectableDates(
  year: number,
  month: number,
  calendarDates: MatchCalendarDate[],
) {
  return calendarDates.some((d) => d.year === year && d.month === month);
}

export default function WhenToWatchDatePicker({
  value,
  onChange,
  placeholder,
  fieldHeight,
  fieldFontSize,
  matches,
}: WhenToWatchDatePickerProps) {
  const { textClass, fontFamily, isRtl, dir, language } = useTranslations();
  const displayValue = value
    ? formatMatchDateDisplay(value, language)
    : null;
  const calendarDates = useMemo(() => getMatchCalendarDates(matches), [matches]);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectableByDay = useMemo(() => {
    const map = new Map<string, string>();
    for (const entry of calendarDates) {
      map.set(calendarCellKey(entry.year, entry.month, entry.day), entry.dateLabel);
    }
    return map;
  }, [calendarDates]);

  const initialMonth = useMemo(() => {
    if (value) {
      const match = calendarDates.find((d) => d.dateLabel === value);
      if (match) return { year: match.year, month: match.month };
    }
    const first = calendarDates[0];
    return first
      ? { year: first.year, month: first.month }
      : { year: new Date().getFullYear(), month: new Date().getMonth() };
  }, [value, calendarDates]);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialMonth.year);
  const [viewMonth, setViewMonth] = useState(initialMonth.month);

  useEffect(() => {
    if (!open) return;
    const match = calendarDates.find((d) => d.dateLabel === value);
    if (match) {
      setViewYear(match.year);
      setViewMonth(match.month);
    }
  }, [open, value, calendarDates]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const monthCells = useMemo(
    () => buildMonthGrid(viewYear, viewMonth, selectableByDay),
    [viewYear, viewMonth, selectableByDay],
  );

  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(isRtl ? "ar" : "en", {
        month: "long",
        year: "numeric",
      }).format(new Date(viewYear, viewMonth, 1)),
    [viewYear, viewMonth, isRtl],
  );

  const weekdays = isRtl ? WEEKDAYS_AR : WEEKDAYS_EN;

  const shiftMonth = (delta: number) => {
    let nextMonth = viewMonth + delta;
    let nextYear = viewYear;
    while (nextMonth < 0) {
      nextMonth += 12;
      nextYear -= 1;
    }
    while (nextMonth > 11) {
      nextMonth -= 12;
      nextYear += 1;
    }
    if (!monthHasSelectableDates(nextYear, nextMonth, calendarDates)) return;
    setViewYear(nextYear);
    setViewMonth(nextMonth);
  };

  const canGoPrev = useMemo(() => {
    let month = viewMonth - 1;
    let year = viewYear;
    if (month < 0) {
      month = 11;
      year -= 1;
    }
    return monthHasSelectableDates(year, month, calendarDates);
  }, [viewYear, viewMonth, calendarDates]);

  const canGoNext = useMemo(() => {
    let month = viewMonth + 1;
    let year = viewYear;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    return monthHasSelectableDates(year, month, calendarDates);
  }, [viewYear, viewMonth, calendarDates]);

  return (
    <div ref={containerRef} dir={dir} className="relative mb-4 w-full">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={`${textClass} flex w-full cursor-pointer items-center justify-between rounded-md border border-solid border-black bg-white px-4 font-extrabold text-black outline-none ${isRtl ? "text-right" : "text-left uppercase"}`}
        style={{
          height: fieldHeight,
          fontSize: fieldFontSize,
          fontFamily,
        }}
      >
        <span className={value ? "text-black" : "text-black/50"}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon />
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={placeholder}
          className={`${textClass} absolute top-[calc(100%+8px)] z-20 w-full min-w-[min(100%,320px)] rounded-md border border-solid border-black bg-white p-3 shadow-lg ${isRtl ? "right-0 left-auto" : "left-0 right-auto"}`}
        >
          <div
            className={`mb-3 flex items-center justify-between gap-2 ${isRtl ? "flex-row-reverse" : ""}`}
          >
            <button
              type="button"
              disabled={!canGoPrev}
              onClick={() => shiftMonth(-1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-lg disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous month"
            >
              {isRtl ? "›" : "‹"}
            </button>
            <span
              className="flex-1 text-center font-extrabold text-black"
              style={{ fontSize: fieldFontSize, fontFamily }}
            >
              {monthLabel}
            </span>
            <button
              type="button"
              disabled={!canGoNext}
              onClick={() => shiftMonth(1)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded border-0 bg-transparent text-lg disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next month"
            >
              {isRtl ? "‹" : "›"}
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-1">
            {weekdays.map((label) => (
              <span
                key={label}
                className="text-center text-[11px] font-bold text-black/55"
              >
                {label}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {monthCells.map((cell, index) => {
              if (!cell.inMonth) {
                return <span key={`empty-${index}`} aria-hidden className="h-9" />;
              }

              const isSelectable = Boolean(cell.dateLabel);
              const isSelected = cell.dateLabel === value;

              return (
                <button
                  key={`${viewYear}-${viewMonth}-${cell.day}`}
                  type="button"
                  disabled={!isSelectable}
                  onClick={() => {
                    if (!cell.dateLabel) return;
                    onChange(cell.dateLabel);
                    setOpen(false);
                  }}
                  className={`flex h-9 cursor-pointer items-center justify-center rounded-md border-0 text-sm font-bold transition-opacity ${
                    isSelected
                      ? "text-white"
                      : isSelectable
                        ? "bg-transparent text-black hover:bg-black/5"
                        : "cursor-default bg-transparent text-black/25"
                  }`}
                  style={
                    isSelected
                      ? { backgroundColor: SELECTED_DAY_BG }
                      : isSelectable
                        ? { color: BRAND_RED }
                        : undefined
                  }
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function CalendarIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="shrink-0 text-black"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M8 3v4M16 3v4M3 11h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
