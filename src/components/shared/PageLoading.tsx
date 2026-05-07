import { Skeleton } from "@/components/ui/skeleton";

type PageLoadingProps = {
  variant?: "landing" | "main" | "auth" | "admin";
};

function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/70 p-5">
      <Skeleton className="mb-5 h-5 w-1/2 bg-muted/60" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton key={index} className="h-4 w-full bg-muted/50" />
        ))}
      </div>
    </div>
  );
}

export function PageLoading({ variant = "main" }: PageLoadingProps) {
  if (variant === "auth") {
    return (
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center">
          <Skeleton className="mb-4 h-20 w-64 bg-muted/50" />
          <Skeleton className="h-8 w-56 bg-muted/50" />
        </div>
        <div className="rounded-xl border border-border/50 bg-card/80 p-6 shadow-[0_24px_48px_rgba(0,0,0,0.45)]">
          <Skeleton className="mb-6 h-10 w-full bg-muted/50" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full bg-muted/50" />
            <Skeleton className="h-12 w-full bg-muted/50" />
            <Skeleton className="h-12 w-full bg-muted/50" />
            <Skeleton className="h-12 w-full bg-primary/30" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="w-full p-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Skeleton className="mb-3 h-12 w-80 bg-muted/50" />
            <Skeleton className="h-5 w-64 bg-muted/50" />
          </div>
          <Skeleton className="h-10 w-72 bg-muted/50" />
        </div>
        <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <CardSkeleton key={index} rows={2} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="rounded-xl border border-border/50 bg-card/60 p-6">
            <Skeleton className="mb-6 h-7 w-56 bg-muted/50" />
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full bg-muted/50" />
              ))}
            </div>
          </div>
          <CardSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (variant === "landing") {
    return (
      <div className="min-h-screen bg-[#0e0e0e] px-4 py-8 text-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Skeleton className="h-14 w-52 bg-muted/50" />
          <Skeleton className="hidden h-10 w-96 bg-muted/50 md:block" />
        </div>
        <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center text-center">
          <Skeleton className="mb-8 h-7 w-64 bg-primary/20" />
          <Skeleton className="mb-4 h-14 w-full max-w-3xl bg-muted/50 md:h-24" />
          <Skeleton className="mb-10 h-14 w-full max-w-4xl bg-muted/50 md:h-24" />
          <div className="mb-12 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-16 bg-primary/30 md:h-28 md:w-24" />
            ))}
          </div>
          <div className="grid w-full max-w-md gap-3 sm:grid-cols-2">
            <Skeleton className="h-14 w-full bg-primary/30" />
            <Skeleton className="h-14 w-full bg-muted/50" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 mx-auto w-full max-w-3xl px-4 pb-10 md:px-0">
      <section className="pb-6 pt-4 md:pt-8">
        <Skeleton className="mb-3 h-12 w-56 bg-muted/50 md:h-16" />
        <Skeleton className="h-5 w-72 bg-muted/50" />
      </section>
      <section className="grid grid-cols-3 gap-3 md:gap-6">
        <CardSkeleton rows={1} />
        <CardSkeleton rows={1} />
        <CardSkeleton rows={1} />
      </section>
      <section className="mt-8 rounded-xl border border-border/50 bg-card/50 p-6">
        <Skeleton className="mb-6 h-64 w-full bg-muted/40" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-20 w-full bg-muted/50" />
          ))}
        </div>
      </section>
    </div>
  );
}
