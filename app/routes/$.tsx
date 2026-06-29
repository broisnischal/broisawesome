import { MdLink, SectionLabel, Squiggle } from "~/components/terminal";

export default function Page() {
  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <SectionLabel>404 — page not found</SectionLabel>

      <Squiggle />

      <p className="text-muted-foreground">
        The page you requested doesn&apos;t exist or has moved.
      </p>

      <p className="mt-4">
        <MdLink label="Back home" to="/" />
      </p>
    </div>
  );
}
