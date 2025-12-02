export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="animate-pulse">
        <div className="h-8 w-72 rounded bg-zinc-200" />
        <div className="mt-6 h-64 rounded bg-zinc-100" />
        <div className="mt-4 h-6 w-40 rounded bg-zinc-100" />
      </div>
    </div>
  );
}
