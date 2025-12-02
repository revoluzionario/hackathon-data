import Link from "next/link";
import type { PaginationMeta } from "@/types/api";

interface Props {
  meta: PaginationMeta;
  basePath?: string;
}

export default function PaginationBar({ meta, basePath = "/posts" }: Props) {
  const { page, totalPages } = meta;

  if (totalPages <= 1) return null;

  const pages: number[] = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
      <Link
        href={`${basePath}?page=${Math.max(1, page - 1)}`}
        className={`rounded-md px-3 py-2 text-sm ${page === 1 ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-100'}`}
      >
        Prev
      </Link>

      <div className="hidden items-center gap-2 md:flex">
        {pages.map((p) => (
          <Link
            key={p}
            href={`${basePath}?page=${p}`}
            className={`rounded-md px-3 py-2 text-sm ${p === page ? 'bg-emerald-600 text-white' : 'hover:bg-zinc-100'}`}
          >
            {p}
          </Link>
        ))}
      </div>

      <Link
        href={`${basePath}?page=${Math.min(totalPages, page + 1)}`}
        className={`rounded-md px-3 py-2 text-sm ${page === totalPages ? 'opacity-50 pointer-events-none' : 'hover:bg-zinc-100'}`}
      >
        Next
      </Link>
    </nav>
  );
}
