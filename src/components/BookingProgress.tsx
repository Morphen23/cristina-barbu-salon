type BookingProgressProps = {
  steps: string[];
  currentIndex: number;
};

export default function BookingProgress({
  steps,
  currentIndex,
}: BookingProgressProps) {
  return (
    <div className="mb-6 md:mb-10">
      <p className="mb-3 text-xs text-muted md:hidden">
        <span className="font-medium text-foreground">
          Pas {currentIndex + 1}/{steps.length}
        </span>
        {" · "}
        {steps[currentIndex]}
      </p>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {steps.map((label, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <div key={label} className="flex min-w-0 flex-1 items-center">
              <div className="flex w-full flex-col gap-1.5 min-w-0 sm:gap-2">
                <div
                  className={`h-0.5 w-full rounded-full transition-colors duration-500 sm:h-px ${
                    isDone || isActive ? "bg-accent" : "bg-border"
                  }`}
                />
                <span
                  className={`hidden truncate text-[0.55rem] uppercase tracking-[0.1em] transition-colors duration-500 md:block ${
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
