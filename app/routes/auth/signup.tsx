import { MdLink, SectionLabel, Squiggle } from "~/components/terminal";

export default function Page() {
  return (
    <div className="w-full max-w-sm text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Signup</h1>
      <p className="mt-1 text-muted-foreground">create an account</p>

      <Squiggle />

      <form method="post" className="space-y-4">
        <div>
          <SectionLabel>Email:</SectionLabel>
          <input
            type="email"
            name="email"
            autoComplete="email"
            required
            className="mt-1 w-full border border-border bg-muted px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-term-link focus:outline-none"
          />
        </div>

        <div>
          <SectionLabel>Password:</SectionLabel>
          <input
            type="password"
            name="password"
            autoComplete="new-password"
            required
            className="mt-1 w-full border border-border bg-muted px-3 py-1.5 font-mono text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-term-link focus:outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="border border-border px-4 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-foreground hover:border-term-link hover:text-term-link transition-colors"
          >
            create account
          </button>
        </div>
      </form>

      <p className="mt-6 text-muted-foreground">
        already have an account?{" "}
        <MdLink label="login" to="/auth/login" />
      </p>
    </div>
  );
}
