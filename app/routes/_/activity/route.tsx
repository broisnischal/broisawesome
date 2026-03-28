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
    <div className="max-w-xl">
      <header className="border-b border-border pb-5 mb-6">
        <h1 className="sr-only text-xl font-semibold tracking-tight text-foreground">
          Activity
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
          Public events from{" "}
          <a
            href={`https://github.com/${username}`}
            className="text-[#0969da] hover:underline dark:text-[#58a6ff]"
            target="_blank"
            rel="noreferrer"
          >
            {username}
          </a>
          .
        </p>
        {error && (
          <p className="mt-3 text-sm text-destructive" role="alert">
            {fromApi ? "GitHub: " : ""}
            {error}
            {rateLimitRemaining != null && rateLimitRemaining <= 10 && (
              <span className="block mt-1 text-muted-foreground text-xs">
                Rate limit remaining: {rateLimitRemaining}
              </span>
            )}
          </p>
        )}
      </header>

      {groups.length === 0 && !error ? (
        <p className="text-sm text-muted-foreground">
          No recent public events.
        </p>
      ) : (
        <ol className="space-y-8 list-none pl-0" aria-label="Activity timeline">
          {groups.map((group) => (
            <li key={group.dateKey}>
              <h2 className="text-sm font-semibold text-foreground mb-3">
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
