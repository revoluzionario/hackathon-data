"use client";

interface PaginationBarProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function buildPageRange(current: number, total: number) {
  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let offset = -1; offset <= 1; offset += 1) {
    const candidate = current + offset;
    if (candidate > 1 && candidate < total) {
      pages.add(candidate);
    }
  }
  return Array.from(pages).sort((a, b) => a - b);
}

export function PaginationBar({ currentPage, totalPages, onPageChange }: PaginationBarProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = buildPageRange(currentPage, totalPages);

  const handleNavigate = (page: number) => {
    if (page === currentPage) {
      return;
    }
    onPageChange(page);
  };

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        type="button"
        className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40"
        onClick={() => handleNavigate(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
      >
        Prev
      </button>
      {pages.map((page, index) => {
        const isCurrent = page === currentPage;
        const prevPage = pages[index - 1];
        const showEllipsis = index > 0 && page - prevPage > 1;
        return (
          <div key={`page-${page}`} className="flex items-center gap-2">
            {showEllipsis && <span className="px-1 text-sm text-zinc-400">...</span>}
            <button
              type="button"
              onClick={() => handleNavigate(page)}
              className={`min-w-[2.25rem] rounded-full px-3 py-1 text-sm font-semibold ${
                isCurrent
                  ? "bg-emerald-600 text-white"
                  : "border border-zinc-200 text-zinc-700 hover:border-emerald-500 hover:text-emerald-600"
              }`}
            >
              {page}
            </button>
          </div>
        );
      })}
      <button
        type="button"
        className="rounded-full border border-zinc-200 px-3 py-1 text-sm text-zinc-600 transition hover:border-emerald-500 hover:text-emerald-600 disabled:opacity-40"
        onClick={() => handleNavigate(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </nav>
  );
}
