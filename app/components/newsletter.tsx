import { useFetcher } from "react-router";
import { Mail } from "lucide-react";

export function Newsletter() {
    const fetcher = useFetcher();

    return (
        <div className="p-6 rounded-lg border border-border bg-card/50 text-card-foreground">
            <div className="flex items-center gap-3 mb-4">
                <Mail size={18} className="text-muted-foreground" />
                <h3 className="text-base font-medium text-foreground">
                    Subscribe to my newsletter
                </h3>
            </div>
            <fetcher.Form method="post" action="/resources/newsletter" className="flex gap-2">
                <input
                    type="email"
                    name="email"
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                />
                <button
                    type="submit"
                    disabled={fetcher.state !== 'idle'}
                    className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                    {fetcher.state === 'submitting' ? 'Subscribing...' : 'Subscribe'}
                </button>
            </fetcher.Form>
            {fetcher.data && (
                <p className={`text-sm mt-3 ${fetcher.data.success
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-destructive'
                    }`}>
                    {fetcher.data.message}
                </p>
            )}
        </div>
    );
}

