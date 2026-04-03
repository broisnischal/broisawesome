import { Link } from "react-router";
import {
  fetchGitHubActivity,
  groupActivityByDate,
} from "~/.server/github-activity";
import { GithubActivityRow } from "~/components/github-activity-row";
import {
  createHeaders,
  createMetaTags,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/activity">Activity</Link>,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Latest activity",
    description:
      "Recent GitHub activity: commits, new repositories, stars, issues, and pull requests by Nischal Dahal (broisnischal).",
    path: "/activity",
    keywords: [
      "GitHub",
      "open source",
      "commits",
      "Nischal Dahal",
      "broisnischal",
      "developer activity",
    ],
  });
  const schema = createPersonSchema({
    description:
      "Public GitHub activity timeline: repositories, contributions, and interactions.",
  });
  return [...metaTags, createSchemaMetaTag(schema)];
};

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=300, s-maxage=600, stale-while-revalidate=3600",
  });
}

export async function loader({ context }: Route.LoaderArgs) {
  const env = context.cloudflare?.env;
  const result = await fetchGitHubActivity(env, { perPage: 40 });
  return {
    ...result,
    groups: groupActivityByDate(result.items),
  };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { groups, username, error, rateLimitRemaining, fromApi } = loaderData;

  return (
    <div className="max-w-xl font-sans">
      <header className="mb-8 border-b border-border pb-6">
        <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
          GitHub
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
          Activity
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Public events from{" "}
          <a
            href={`https://github.com/${username}`}
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            @{username}
          </a>
          .
        </p>
        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {fromApi ? "GitHub: " : ""}
            {error}
            {rateLimitRemaining != null && rateLimitRemaining <= 10 && (
              <span className="mt-1 block text-sm text-muted-foreground">
                Rate limit remaining: {rateLimitRemaining}
              </span>
            )}
          </p>
        )}
      </header>

      {groups.length === 0 && !error ? (
        <p className="text-base text-muted-foreground">
          No recent public events.
        </p>
      ) : (
        <ol className="space-y-8 list-none pl-0" aria-label="Activity timeline">
          {groups.map((group) => (
            <li key={group.dateKey}>
              <h2 className="mb-3 text-base font-semibold tracking-tight text-foreground">
                <time dateTime={group.dateKey}>{group.label}</time>
              </h2>
              <ul className="list-none pl-0 space-y-0">
                {group.items.map((item, i) => (
                  <GithubActivityRow
                    key={item.id}
                    item={item}
                    variant="timeline"
                    isLast={i === group.items.length - 1}
                    timeFormat="time"
                  />
                ))}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
