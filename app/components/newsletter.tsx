import { useFetcher } from "react-router";
import { Mail } from "lucide-react";

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
          <h3 className="text-base font-medium text-foreground">
            Subscribe to my newsletter
          </h3>
        </div>
      )}
      {isMinimal && (
        <p className="mb-2 text-xs text-muted-foreground leading-snug">
          Occasional updates on posts and projects — no spam.
        </p>
      )}
      <fetcher.Form
        method="post"
        action="/resources/newsletter"
        className={cn(
          "flex w-full gap-2",
          isMinimal ? "flex-col sm:flex-row sm:items-stretch" : "flex-col sm:flex-row",
        )}
      >
        <label className="sr-only" htmlFor={isMinimal ? "footer-newsletter-email" : "newsletter-email"}>
          Email for newsletter
        </label>
        <input
          id={isMinimal ? "footer-newsletter-email" : "newsletter-email"}
          type="email"
          name="email"
          placeholder="you@example.com"
          required
          autoComplete="email"
          className={cn(
            "min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-foreground placeholder:text-muted-foreground transition-colors",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isMinimal ? "h-9 text-sm" : "h-10 py-2.5 text-sm sm:min-w-[200px]",
          )}
        />
        <Button
          type="submit"
          size={isMinimal ? "sm" : "default"}
          disabled={fetcher.state !== "idle"}
          className={cn(isMinimal && "shrink-0 sm:w-auto")}
        >
          {fetcher.state === "submitting"
            ? isMinimal
              ? "…"
              : "Subscribing…"
            : "Subscribe"}
        </Button>
      </fetcher.Form>
      {fetcher.data && (
        <p
          className={cn(
            "mt-3 text-sm",
            fetcher.data.success
              ? "text-green-600 dark:text-green-400"
              : "text-destructive",
            isMinimal && "mt-2 text-xs",
          )}
          role="status"
        >
          {fetcher.data.message}
        </p>
      )}
    </div>
  );
}

export function Newsletter() {
  return <NewsletterSubscribeForm variant="prominent" />;
}
