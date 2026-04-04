import { Loader2, Mail, Send } from "lucide-react";
import { useFetcher } from "react-router";

import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";

type NewsletterResponse = { success: boolean; message: string };

export function NewsletterSubscribeForm({
  variant = "prominent",
}: {
  variant?: "prominent" | "minimal";
}) {
  const fetcher = useFetcher<NewsletterResponse>();
  const isMinimal = variant === "minimal";
  const isSubmitting = fetcher.state === "submitting";

  return (
    <div
      className={cn(
        !isMinimal && "mt-8 w-full px-4 text-card-foreground md:px-0",
      )}
    >
      {!isMinimal && (
        <div className="mb-4 flex items-center gap-3">
          <Mail
            className="size-[18px] shrink-0 text-muted-foreground"
            strokeWidth={1.5}
            aria-hidden
          />
          <h3 className="text-lg font-semibold text-foreground">
            Subscribe to my newsletter
          </h3>
        </div>
      )}
      <fetcher.Form
        method="post"
        action="/resources/newsletter"
        className={cn("w-full", isMinimal ? "group/form" : "flex gap-2")}
      >
        <label
          className="sr-only"
          htmlFor={isMinimal ? "footer-newsletter-email" : "newsletter-email"}
        >
          Email for newsletter
        </label>
        {isMinimal ? (
          <div
            className={cn(
              "relative flex w-full min-w-0 items-center gap-1 rounded-full border border-border/45 bg-muted/25 p-1 pl-4 shadow-[0_1px_0_0_oklch(0_0_0/0.03)]",
              "dark:border-white/10 dark:bg-white/4 dark:shadow-[inset_0_1px_0_0_oklch(1_0_0/0.04)]",
              "transition-[border-color,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]",
              "has-[input:focus-visible]:border-foreground/18 has-[input:focus-visible]:bg-background/90 has-[input:focus-visible]:shadow-[0_4px_20px_-4px_oklch(0_0_0/0.08)]",
              "dark:has-[input:focus-visible]:border-white/14 dark:has-[input:focus-visible]:shadow-[0_4px_24px_-4px_oklch(0_0_0/0.35)]",
            )}
          >
            <input
              id="footer-newsletter-email"
              type="email"
              name="email"
              placeholder="Email address"
              required
              autoComplete="email"
              disabled={isSubmitting}
              className={cn(
                "min-h-10 min-w-0 flex-1 border-0 bg-transparent py-2 pr-2 text-sm text-foreground outline-none",
                "placeholder:text-muted-foreground/70 placeholder:transition-opacity placeholder:duration-200",
                "focus:placeholder:text-muted-foreground/45",
                "focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "group/btn relative h-10 shrink-0 overflow-hidden rounded-full px-5 font-medium",
                "shadow-[0_1px_2px_oklch(0_0_0/0.06)] transition-[transform,box-shadow,opacity] duration-200 ease-out",
                "hover:scale-[1.02] hover:shadow-[0_2px_8px_-2px_oklch(0_0_0/0.12)] active:scale-[0.98] active:duration-100",
                "dark:shadow-[0_1px_2px_oklch(0_0_0/0.2)] dark:hover:shadow-[0_2px_12px_-2px_oklch(0_0_0/0.45)]",
                "disabled:pointer-events-none disabled:scale-100 disabled:opacity-60",
                "after:pointer-events-none after:absolute after:inset-0 after:rounded-full after:opacity-0 after:transition-opacity after:duration-300",
                "after:bg-linear-to-tr after:from-transparent after:via-white/25 after:to-transparent dark:after:via-white/10",
                "hover:after:opacity-100",
              )}
            >
              <span className="relative z-10 inline-flex items-center gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2
                      className="size-4 shrink-0 animate-spin"
                      aria-hidden
                    />
                    <span className="sr-only">Subscribing</span>
                  </>
                ) : (
                  <>
                    <span>Subscribe</span>
                    <Send
                      className="size-3.5 shrink-0 opacity-90 transition-transform duration-200 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-px"
                      aria-hidden
                      strokeWidth={2}
                    />
                  </>
                )}
              </span>
            </Button>
          </div>
        ) : (
          <>
            <input
              id="newsletter-email"
              type="email"
              name="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              disabled={isSubmitting}
              className={cn(
                "box-border min-w-0 flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-foreground placeholder:text-muted-foreground",
                "transition-[border-color,box-shadow] duration-200",
                "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/45",
                "h-10 text-sm leading-none sm:min-w-[200px]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            />
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting}
              className="h-10 shrink-0 rounded-xl px-6 transition-[transform,opacity] duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:scale-100 sm:w-auto"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Subscribing…
                </span>
              ) : (
                "Subscribe"
              )}
            </Button>
          </>
        )}
      </fetcher.Form>
      {fetcher.data ? (
        <p
          key={fetcher.data.message}
          className={cn(
            "animate-in fade-in slide-in-from-bottom-2 duration-300",
            "mt-3 text-sm",
            fetcher.data.success
              ? "text-green-600 dark:text-green-400"
              : "text-destructive",
            isMinimal && "mt-2.5 text-xs",
          )}
          role="status"
        >
          {fetcher.data.message}
        </p>
      ) : null}
    </div>
  );
}

export function Newsletter() {
  return <NewsletterSubscribeForm variant="prominent" />;
}
