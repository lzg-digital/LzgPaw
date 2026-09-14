export default function Loading() {
  return (
    <div className="container-content py-16">
      <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-square rounded-2xl bg-sage" />
            <div className="mt-3 h-4 w-3/4 rounded bg-sage" />
            <div className="mt-2 h-4 w-1/3 rounded bg-sage" />
          </div>
        ))}
      </div>
    </div>
  );
}
