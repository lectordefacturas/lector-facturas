"use client";

import { useEffect, useRef, useState } from "react";

export type AutocompleteItem = {
  /** Texto que aparece en el input cuando se selecciona */
  label: string;
  /** Texto opcional secundario que aparece en el dropdown (ej. código GCI) */
  sublabel?: string;
  /** Cualquier campo para buscar — concat de varios si hace falta */
  searchText: string;
  /** Referencia al objeto original para cuando se selecciona */
  raw: unknown;
};

type Props = {
  value: string;
  items: AutocompleteItem[];
  onChange: (value: string, raw?: unknown) => void;
  placeholder?: string;
  hint?: string;
  className?: string;
  maxResults?: number;
};

export function Autocomplete({
  value,
  items,
  onChange,
  placeholder,
  hint,
  className = "",
  maxResults = 10,
}: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, []);

  const q = value.trim().toLowerCase();
  const filtered =
    q.length === 0
      ? items.slice(0, maxResults)
      : items
          .filter((it) => it.searchText.toLowerCase().includes(q))
          .slice(0, maxResults);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        className="w-full rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-2 py-1.5 text-sm text-zinc-900 dark:text-zinc-100"
      />
      {hint && (
        <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1">
          <span>○</span> {hint}
        </p>
      )}
      {open && filtered.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full max-h-60 overflow-auto rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg text-sm">
          {filtered.map((it, i) => (
            <li
              key={i}
              className="px-2 py-1.5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onMouseDown={(e) => {
                // mousedown porque blur del input cierra el dropdown antes que click
                e.preventDefault();
                onChange(it.label, it.raw);
                setOpen(false);
              }}
            >
              <div className="text-zinc-900 dark:text-zinc-100">
                {it.label}
              </div>
              {it.sublabel && (
                <div className="text-xs text-zinc-500">{it.sublabel}</div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
