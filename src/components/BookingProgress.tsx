type BookingProgressProps = {
  steps: string[];
  currentIndex: number;
};

export default function BookingProgress({
  steps,
  currentIndex,
}: BookingProgressProps) {
  return (
    <div className="mb-10 md:mb-12">
      <div className="flex items-center gap-2">
        {steps.map((label, index) => {
          const isActive = index === currentIndex;
          const isDone = index < currentIndex;
          return (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                <div
                  className={`h-px w-full transition-colors duration-500 ${
                    isDone || isActive ? "bg-accent" : "bg-border"
                  }`}
                />
                <span
                  className={`truncate text-[0.6rem] uppercase tracking-[0.16em] transition-colors duration-500 ${
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
