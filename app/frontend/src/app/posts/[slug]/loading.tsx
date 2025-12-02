export default function PostDetailLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="aspect-[16/9] animate-pulse rounded-3xl bg-zinc-200" />
        <div className="space-y-3 text-center">
          <div className="mx-auto h-4 w-32 animate-pulse rounded-full bg-zinc-200" />
          <div className="mx-auto h-10 w-3/4 animate-pulse rounded-full bg-zinc-200" />
          <div className="mx-auto h-4 w-2/3 animate-pulse rounded-full bg-zinc-200" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={`paragraph-${index}`} className="h-4 w-full animate-pulse rounded-full bg-zinc-200" />
          ))}
        </div>
      </div>
    </main>
  );
}
