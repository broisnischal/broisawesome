import { Link } from "react-router";
import {
  fetchGitHubActivity,
  groupActivityByDate,
} from "~/.server/github-activity";
import {
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
import {
  createHeaders,
  createMetaTags,
  createPageSchema,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/activity">activity</Link>,
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
  return [
    ...metaTags,
    createSchemaMetaTag(schema),
    createPageSchema({
      title: "Activity — Nischal Dahal",
      description:
        "Recent GitHub activity: commits, repositories, stars, issues, and pull requests by Nischal Dahal (broisnischal).",
      path: "/activity",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Activity", path: "/activity" },
      ],
      type: "CollectionPage",
    }),
  ];
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
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Activity</h1>
      <p className="mt-2 text-muted-foreground">
        public events from{" "}
        <a
          href={`https://github.com/${username}`}
          className="term-link"
          target="_blank"
          rel="noreferrer"
        >
          @{username}
        </a>
      </p>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {fromApi ? "GitHub: " : ""}
          {error}
          {rateLimitRemaining != null && rateLimitRemaining <= 10 && (
            <span className="mt-1 block text-sm text-muted-foreground">
              rate limit remaining: {rateLimitRemaining}
            </span>
          )}
        </p>
      )}

      {groups.length === 0 && !error ? (
        <p className="mt-6 text-muted-foreground">
          no recent public events.
        </p>
      ) : (
        <div className="mt-6 space-y-8" aria-label="Activity timeline">
          {groups.map((group, gi) => (
            <section key={group.dateKey} aria-label={group.label}>
              {gi > 0 && <Squiggle />}
              <SectionLabel>
                <time dateTime={group.dateKey}>{group.label}:</time>
              </SectionLabel>
              <MdList>
                {group.items.map((item) => {
                  const structured =
                    item.action != null &&
                    item.repoLabel != null &&
                    item.repoUrl != null;
                  return (
                    <MdListItem key={item.id}>
                      <span className="text-muted-foreground">
                        {structured ? (
                          <>
                            <span className="text-foreground">
                              {item.action}
                            </span>
                            <a
                              href={item.repoUrl!}
                              target="_blank"
                              rel="noreferrer noopener"
                              className="term-link"
                            >
                              {item.repoLabel}
                            </a>
                            {item.tail ? (
                              <span className="text-muted-foreground">
                                {item.tail}
                              </span>
                            ) : null}
                          </>
                        ) : (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="term-link"
                          >
                            {item.title}
                          </a>
                        )}
                        {item.subtitle ? (
                          <span className="ml-1 text-muted-foreground/70">
                            — {item.subtitle}
                          </span>
                        ) : null}
                        <time
                          className="ml-2 font-mono text-xs tabular-nums text-muted-foreground/60"
                          dateTime={item.createdAt}
                        >
                          {new Date(item.createdAt).toLocaleTimeString(
                            undefined,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </time>
                      </span>
                    </MdListItem>
                  );
                })}
              </MdList>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
