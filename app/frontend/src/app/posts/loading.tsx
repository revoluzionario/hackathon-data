export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="animate-pulse">
        <div className="h-8 w-48 rounded bg-zinc-200" />
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          <div className="h-56 rounded bg-zinc-100" />
          <div className="h-56 rounded bg-zinc-100" />
          <div className="h-56 rounded bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
export default function PostsLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-zinc-200" />
          <div className="mx-auto h-10 w-2/3 animate-pulse rounded-full bg-zinc-200" />
          <div className="mx-auto h-4 w-1/2 animate-pulse rounded-full bg-zinc-200" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="space-y-4 rounded-2xl border border-zinc-100 bg-white p-4 shadow-sm">
              <div className="h-40 w-full animate-pulse rounded-2xl bg-zinc-200" />
              <div className="h-5 w-3/4 animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 w-full animate-pulse rounded-full bg-zinc-200" />
              <div className="h-4 w-1/2 animate-pulse rounded-full bg-zinc-200" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
