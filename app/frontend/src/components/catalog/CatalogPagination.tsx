"use client";

import type { ProductListMeta } from "@/types/api";

interface CatalogPaginationProps {
  meta: ProductListMeta;
  onPageChange: (page: number) => void;
}

function buildPageList(current: number, total: number, maxButtons = 5) {
  const pages: number[] = [];
  const half = Math.floor(maxButtons / 2);
  let start = Math.max(1, current - half);
  let end = start + maxButtons - 1;

  if (end > total) {
    end = total;
    start = Math.max(1, end - maxButtons + 1);
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }
  return pages;
}

export function CatalogPagination({ meta, onPageChange }: CatalogPaginationProps) {
  if (meta.totalPages <= 1) {
    return null;
  }

  const pages = buildPageList(meta.page, meta.totalPages);

  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-3" aria-label="Catalog pagination">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, meta.page - 1))}
        disabled={meta.page === 1}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Prev
      </button>
      {pages[0] > 1 && (
        <button
          type="button"
          onClick={() => onPageChange(1)}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-emerald-500"
        >
          1
        </button>
      )}
      {pages[0] > 2 && <span className="text-sm text-zinc-400">...</span>}
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === meta.page ? "page" : undefined}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
            page === meta.page
              ? "bg-emerald-600 text-white"
              : "border border-zinc-200 text-zinc-600 hover:border-emerald-500"
          }`}
        >
          {page}
        </button>
      ))}
      {pages[pages.length - 1] < meta.totalPages - 1 && <span className="text-sm text-zinc-400">...</span>}
      {pages[pages.length - 1] < meta.totalPages && (
        <button
          type="button"
          onClick={() => onPageChange(meta.totalPages)}
          className="rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-emerald-500"
        >
          {meta.totalPages}
        </button>
      )}
      <button
        type="button"
        onClick={() => onPageChange(Math.min(meta.totalPages, meta.page + 1))}
        disabled={meta.page === meta.totalPages}
        className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
      </button>
    </nav>
  );
}
