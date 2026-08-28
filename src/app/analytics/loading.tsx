export default function AnalyticsLoading() {
  return (
    <div className="min-h-[calc(100svh-8rem)] bg-[#080808] px-4 pt-[calc(var(--nav-clearance)+1.5rem)] pb-14 text-white sm:px-6">
      <div className="mx-auto max-w-[92rem] animate-pulse">
        <div className="h-3 w-28 rounded-full bg-[#e8bd68]/20" />
        <div className="mt-5 h-12 max-w-md rounded-2xl bg-white/[0.06]" />
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="h-36 rounded-[1.6rem] border border-white/[0.06] bg-white/[0.03]"
            />
          ))}
        </div>
        <div className="mt-4 h-80 rounded-[1.9rem] border border-white/[0.06] bg-white/[0.03]" />
      </div>
    </div>
  );
}
