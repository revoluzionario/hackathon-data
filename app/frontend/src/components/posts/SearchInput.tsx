"use client";

import { useId } from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = "Search articles" }: SearchInputProps) {
  const inputId = useId();

  return (
    <div className="w-full">
      <label htmlFor={inputId} className="sr-only">
        Search blog posts
      </label>
      <div className="relative">
        <input
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 pl-11 text-sm text-zinc-800 shadow-sm transition placeholder:text-zinc-400 focus:border-emerald-500 focus:outline-none"
        />
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="7" />
            <path d="m16.5 16.5 3 3" />
          </svg>
        </span>
      </div>
    </div>
  );
}
