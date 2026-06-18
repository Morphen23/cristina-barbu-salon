type BookingProgressProps = {
  steps: string[];
  currentIndex: number;
};

export default function BookingProgress({
  steps,
  currentIndex,
}: BookingProgressProps) {
  return (
    <div className="mb-8 md:mb-12">
      <p className="mb-4 text-[0.65rem] uppercase tracking-[0.2em] text-muted md:hidden">
        Pas {currentIndex + 1} din {steps.length} · {steps[currentIndex]}
      </p>

      <div className="flex items-center gap-2">
        {steps.map((label, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <div key={label} className="flex flex-1 min-w-0 items-center gap-2">
              <div className="flex flex-1 flex-col gap-2 min-w-0">
                <div
                  className={`h-px w-full transition-colors duration-500 ${
                    isDone || isActive ? "bg-accent" : "bg-border"
                  }`}
                />
                <span
                  className={`hidden truncate text-[0.6rem] uppercase tracking-[0.14em] transition-colors duration-500 sm:block ${
                    isActive ? "text-foreground" : isDone ? "text-accent" : "text-muted/60"
                  }`}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
