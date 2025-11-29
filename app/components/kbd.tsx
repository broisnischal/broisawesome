import { cn } from "~/lib/utils";

export function Kbd({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        "px-1.5 py-0.5 text-xs text-foreground bg-muted border border-border rounded text-center",
        className
      )}
    >
      {children}
    </kbd>
  );
}

