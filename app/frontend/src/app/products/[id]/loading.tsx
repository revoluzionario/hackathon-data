export default function ProductLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-4">
          <div className="aspect-square animate-pulse rounded-3xl bg-zinc-100" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-20 animate-pulse rounded-2xl bg-zinc-100" />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="h-4 w-32 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-8 w-3/4 animate-pulse rounded-full bg-zinc-100" />
            <div className="h-4 w-full animate-pulse rounded-full bg-zinc-100" />
          </div>
          <div className="h-10 w-40 animate-pulse rounded-full bg-zinc-100" />
          <div className="h-12 w-full animate-pulse rounded-full bg-zinc-100" />
          <div className="h-12 w-full animate-pulse rounded-full bg-zinc-100" />
        </div>
      </div>
      <div className="mt-10 space-y-4 rounded-3xl border border-zinc-100 bg-white p-6 shadow-sm">
        <div className="h-5 w-64 animate-pulse rounded-full bg-zinc-100" />
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`detail-${index}`} className="h-4 w-full animate-pulse rounded-full bg-zinc-100" />
          ))}
        </div>
      </div>
    </main>
  );
}
