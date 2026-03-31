import { Mail } from "lucide-react";
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
          Occasional updates on posts and projects, no spam.
        </p>
      )}
      <fetcher.Form
        method="post"
        action="/resources/newsletter"
        className={cn("flex w-full gap-2")}
      >
        <label
          className="sr-only"
          htmlFor={isMinimal ? "footer-newsletter-email" : "newsletter-email"}
        >
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
            "box-border min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-0 text-foreground placeholder:text-muted-foreground transition-colors",
            "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
            isMinimal
              ? "h-9 text-sm leading-none"
              : "h-10 py-2.5 text-sm sm:min-w-[200px]",
          )}
        />
        <Button
          type="submit"
          size={isMinimal ? "default" : "lg"}
          disabled={fetcher.state !== "idle"}
          className={cn(
            isMinimal && "h-9 shrink-0 px-4 py-0 sm:w-auto",
            !isMinimal && "sm:w-auto",
          )}
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
