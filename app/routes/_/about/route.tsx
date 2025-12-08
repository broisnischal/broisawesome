import { Link, data } from "react-router";
import type { Route } from "./+types/route";
import {
  createMetaTags,
  createHeaders,
  createPersonSchema,
  createSchemaMetaTag,
} from "~/lib/meta";
import { Dumbbell } from "lucide-react";

export const handle = {
  breadcrumb: () => <Link to="/about">About</Link>,
};

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "About",
    description:
      "About Nischal Dahal - Software developer passionate about technology, serverless architecture, and building great user experiences. Learn more about my journey.",
    path: "/about",
    keywords: [
      "Nischal Dahal",
      "Nischal",
      "broisnischal",
      "about",
      "software developer",
      "developer profile",
    ],
  });

  // Add Person schema
  const schema = createPersonSchema({
    description:
      "Software developer passionate about technology, serverless architecture, and building great user experiences.",
  });

  return [...metaTags, createSchemaMetaTag(schema)];
};

export function headers() {
  return createHeaders();
}

export async function loader() {
  return data({});
}

export default function Page() {
  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="sr-only text-3xl md:text-4xl font-bold text-foreground mb-2">
          About Nischal Dahal
        </h1>
        <p className="text-muted-foreground">
          Learn more about me and my journey.
        </p>

        <GymDetails />
      </div>
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-foreground mb-4">Error</h1>
      <p className="text-destructive">{error.message}</p>
    </div>
  );
}

function GymDetails() {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-4">
        <Dumbbell className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Gym PR</h2>
      </div>

      <p className="text-foreground leading-loose">
        When I&apos;m not coding, you&apos;ll find me at the gym pushing my
        limits. My current personal records include a{" "}
        <span className="font-medium">💪 Bench (40kg)</span>, a{" "}
        <span className="font-medium">🦵 Squat (55kg)</span>, and a{" "}
        <span className="font-medium">🔥 Deadlift (130kg)</span>. For bodyweight
        exercises, I can do{" "}
        <span className="font-medium">🏋️ Pull-ups (10 with weight)</span>,{" "}
        <span className="font-medium">💥 Push-ups (80)</span>,{" "}
        <span className="font-medium">✨ Sit-ups (100)</span>, and{" "}
        <span className="font-medium">🚀 Leg-raises (70)</span>. Fitness is an
        integral part of my routine, helping me maintain both physical and
        mental strength for long coding sessions.
      </p>
    </div>
  );
}
