import { Outlet } from "react-router";
import { Squiggle } from "~/components/terminal";

export default function Page() {
  return (
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <p className="text-muted-foreground uppercase tracking-[0.12em] font-mono text-xs">
        auth
      </p>
      <Squiggle />
      <Outlet />
    </div>
  );
}
