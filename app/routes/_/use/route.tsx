import { ArrowUpRightIcon } from "lucide-react";
import { Link } from "react-router";

export const handle = {
  breadcrumb: () => <Link to="/use">Use</Link>,
};

// export function headers() {
//   return createHeaders();
// }

export default function Page() {
  return <Use />;
}

type DevSublink = {
  label: string;
  link: string;
};

type DevEntry = {
  name: string;
  detail?: string;
  link?: string;
  sublinks?: DevSublink[];
};

type DevSubsection = {
  title: string;
  items: DevEntry[];
};

const developmentSubsections: DevSubsection[] = [
  {
    title: "Editor & environment",
    items: [
      {
        name: "Cursor",
        detail:
          "Where I spend most of my typing. Jump around the repo, fix things inline, ask dumb questions out loud.",
        link: "https://cursor.com",
      },
      {
        name: "Baseline settings",
        detail:
          "Format on save, strip trailing space, keep a newline at EOF. Indent is whatever the project already uses, usually two spaces.",
      },
      {
        name: "Typography",
        detail:
          "Geist Mono in the editor, Geist in the UI. Line height bumped a notch so my eyes don't hate me.",
        sublinks: [{ label: "Geist fonts", link: "https://vercel.com/font" }],
      },
      {
        name: "Product icons",
        detail:
          "Whatever icon pack reads fastest at a glance. I swap sometimes; not religious about it.",
        sublinks: [
          {
            label: "Material Icon Theme (VS Code)",
            link: "https://marketplace.visualstudio.com/items?itemName=PKief.material-icon-theme",
          },
        ],
      },
      {
        name: "Formatting & lint",
        detail:
          "Let the machine handle spacing. I wire up whatever the repo expects and try not to fight it.",
        sublinks: [
          { label: "Prettier", link: "https://prettier.io" },
          { label: "ESLint", link: "https://eslint.org" },
          { label: "Biome", link: "https://biomejs.dev" },
        ],
      },
      {
        name: "Themes",
        detail:
          "Dark mode first. Catppuccin vibes or flat grays, and I match the OS when I remember to.",
        sublinks: [
          {
            label: "Catppuccin",
            link: "https://github.com/catppuccin/catppuccin",
          },
        ],
      },
    ],
  },
  {
    title: "Browser",
    items: [
      {
        name: "Zen Browser",
        detail:
          "Firefox-based, vertical tabs, workspaces. Feels less noisy than Chrome for long sessions.",
        link: "https://zen-browser.app",
      },
      {
        name: "Extensions",
        detail:
          "Small list on purpose. If something makes the bar crowded or the browser slow, I uninstall it.",
        sublinks: [
          {
            label: "uBlock Origin",
            link: "https://github.com/gorhill/uBlock",
          },
          {
            label: "1Password",
            link: "https://1password.com/downloads/browser/",
          },
        ],
      },
      {
        name: "Zen mods & tweaks",
        detail:
          "Tighter layout, accent color, sidebar stuff. I add things, get bored, delete half of them.",
        sublinks: [
          {
            label: "Zen documentation",
            link: "https://docs.zen-browser.app/",
          },
        ],
      },
      {
        name: "Dev tooling in-browser",
        detail:
          "React DevTools when I'm in React land, network tab when something won't load, resize mode when CSS fights me.",
        sublinks: [
          {
            label: "React DevTools",
            link: "https://react.dev/learn/react-developer-tools",
          },
        ],
      },
    ],
  },
  {
    title: "AI & assistants",
    items: [
      {
        name: "Claude",
        detail:
          "Good when I want something explained slowly or a draft that doesn't sound like a tweet thread.",
        link: "https://claude.ai",
      },
      {
        name: "Hugging Face",
        detail:
          "Poking at open models, comparing checkpoints, sometimes running stuff in the browser. Rabbit hole friendly.",
        link: "https://huggingface.co",
      },
      {
        name: "Perplexity",
        detail:
          "When I want links back, not a confident paragraph with no sources.",
        link: "https://www.perplexity.ai",
      },
      {
        name: "Notebook LM",
        detail:
          "Dump PDFs and notes in, get summaries and weird podcast versions. Surprisingly handy for studying.",
        link: "https://notebooklm.google.com",
      },
      {
        name: "Cursor / IDE agents",
        detail:
          "Rename across files, scaffold tests, run commands from the sidebar. Still check the diff like a paranoid person.",
      },
    ],
  },
  {
    title: "CLI",
    items: [
      {
        name: "git & GitHub CLI",
        detail:
          "Push, PR, review, repeat. `gh` saves me from clicking through GitHub.",
        link: "https://cli.github.com",
      },
      {
        name: "Package & runtime",
        detail:
          "Bun or Node depending on mood and what broke last week. pnpm-style installs when the project cares.",
        link: "https://bun.sh",
      },
      {
        name: "Search & navigation",
        detail:
          "Search code, find files, fuzzy pick. That's most of my terminal joy.",
        sublinks: [
          { label: "ripgrep", link: "https://github.com/BurntSushi/ripgrep" },
          { label: "fd", link: "https://github.com/sharkdp/fd" },
          { label: "fzf", link: "https://github.com/junegunn/fzf" },
        ],
      },
      {
        name: "Shell polish",
        detail:
          "Starship for a short prompt and a few aliases for commands I type fifty times a day.",
        link: "https://starship.rs",
      },
    ],
  },
  {
    title: "Design & creativity",
    items: [
      {
        name: "Figma",
        detail:
          'Mockups, components, "what if this button lived here" experiments.',
        link: "https://www.figma.com",
      },
      {
        name: "Adobe",
        detail:
          "Photoshop and Lightroom for photos; Illustrator when I need vectors and patience.",
        link: "https://www.adobe.com",
      },
      {
        name: "OBS Studio",
        detail:
          "Screen records, simple scenes, the occasional stream when I'm brave enough.",
        link: "https://obsproject.com",
      },
      {
        name: "Excalidraw",
        detail:
          "Rough diagrams that still look fine pasted into a doc or a PR.",
        link: "https://excalidraw.com",
      },
    ],
  },
];

function formatKindLabel(kind: string): string {
  return kind
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function CatalogList({
  items,
}: {
  items: { name: string; kind: string; link?: string }[];
}) {
  return (
    <ul className="m-0 p-0 list-none rounded-lg border border-border divide-y divide-border bg-muted/20">
      {items.map((item) => (
        <li
          key={item.name}
          className="px-4 py-3.5 sm:px-5 sm:py-4 flex flex-col gap-1 sm:grid sm:grid-cols-[minmax(0,6.5rem)_1fr] sm:gap-8 sm:items-baseline"
        >
          <span className="text-[0.65rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {formatKindLabel(item.kind)}
          </span>
          <div className="min-w-0">
            {item.link ? (
              <Link
                to={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-base font-medium text-foreground transition-colors hover:text-primary"
              >
                <span className="text-pretty">{item.name}</span>
                <ArrowUpRightIcon
                  className="size-3.5 shrink-0 opacity-45 group-hover:opacity-90 mt-0.5"
                  aria-hidden
                />
              </Link>
            ) : (
              <span className="text-base font-medium text-pretty text-foreground">
                {item.name}
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

function DevSublinkList({ items }: { items: DevSublink[] }) {
  return (
    <ul className="mt-2 flex flex-col gap-1 m-0 p-0 list-none border-l border-border/80 pl-3 ml-0.5">
      {items.map((s) => (
        <li key={s.label}>
          <Link
            to={s.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            {s.label}
            <ArrowUpRightIcon
              className="size-3 shrink-0 opacity-40 group-hover:opacity-80"
              aria-hidden
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}

function DevelopmentSection() {
  return (
    <section className="border-t border-border pt-8 mt-2 flex flex-col gap-10">
      <header className="flex flex-col gap-2">
        <h2 className="text-primary text-lg font-mono">Development</h2>
        <p className="text-base text-muted-foreground text-left leading-relaxed">
          Editors, browser, a handful of AI tabs, terminal tools, and the design
          apps I open when I&apos;m not just writing code. Honest list, not a
          resume keyword dump.
        </p>
      </header>

      <div className="flex flex-col gap-10">
        {developmentSubsections.map((subsection) => (
          <div key={subsection.title} className="flex flex-col gap-4">
            <h3 className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {subsection.title}
            </h3>
            <ul className="flex flex-col gap-3.5 m-0 p-0 list-none">
              {subsection.items.map((entry) => (
                <li key={entry.name} className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                    {entry.link ? (
                      <Link
                        to={entry.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-medium text-foreground hover:text-primary transition-colors group w-fit"
                      >
                        {entry.name}
                        <ArrowUpRightIcon
                          className="size-3.5 shrink-0 opacity-50 group-hover:opacity-90"
                          aria-hidden
                        />
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-foreground">
                        {entry.name}
                      </span>
                    )}
                  </div>
                  {entry.detail ? (
                    <p className="text-sm text-muted-foreground leading-relaxed m-0 pl-0 max-w-prose">
                      {entry.detail}
                    </p>
                  ) : null}
                  {entry.sublinks?.length ? (
                    <DevSublinkList items={entry.sublinks} />
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Use() {
  const keys = [
    "hardware",
    "essentials",
    "periphery",
    "personal care",
  ] as const;
  type ItemWithLink = {
    name: string;
    kind:
      | "editor"
      | "development"
      | "wireless"
      | "portable"
      | "audio"
      | "utility"
      | "others"
      | (string & {});
    link?: string;
    icon?: string;
  };

  const items: Record<(typeof keys)[number], ItemWithLink[]> = {
    hardware: [
      {
        name: 'MacBook Pro M3 18Gb 14" 512GB',
        link: "https://www.apple.com/shop/buy-mac/macbook-pro",
        kind: "laptop",
      },
      {
        name: 'ASUS Zenbook | 14" 16GB 1TB',
        link: "https://www.asus.com/laptops/zenbook/zenbook-14/ZENBOOK-14-UX434F/oled-screen-1920x1080-display-14-inch-oled-screen-1920x1080-display-14-inch-intel-core-i5-1240p-processor-16-gb-ram-512-gb-ssd-windows-11-home-4gb-nvidia-geforce-rtx-3050-laptop-ZENBOOK-14-UX434F-202601L-G20000/d-100115703-b-4",
        kind: "laptop-2",
      },
      {
        name: "Nothing Phone 1",
        link: "https://intl.nothing.tech/products/phone-1?colour=Black&capacity=8%2B256GB",
        kind: "phone-1",
      },
      {
        name: "Poco X6 5G",
        kind: "phone-2",
      },
      {
        name: "Samsontech C01U Pro",
        link: "https://samsontech.com/products/microphones/usb-microphones/c01upro/",
        kind: "microphone",
      },
      {
        name: "Razer Deathadder V2",
        link: "https://www.razer.com/gaming-mice/razer-deathadder-v2-x-hyperspeed",
        kind: "mouse",
      },
      {
        name: "Wireless Charging Pod",
        link: "https://www.amazon.in/Vaku-Wireless-Charger-Charging-Qi-Certified/dp/B0C33K4VVR?th=1",
        kind: "utility",
      },
      {
        name: "Ergonomic S121T",
        link: "https://www.avinyastore.com/product/ergonomics-office-chair-s121",
        kind: "workspace",
      },
      {
        name: "Pirka",
        kind: "workspace",
        link: "https://www.instagram.com/p/C2JjnddNqPc/?hl=en",
      },
      {
        name: "MAG 275QF E20 | Monitor",
        kind: "monitor",
        link: "https://www.msi.com/Monitor/MAG-275QF-E20",
      },
      {
        name: "Nothing Ear 2",
        link: "https://intl.nothing.tech/products/ear-2",
        kind: "earbud",
      },
      {
        name: "Watch Pro 2",
        // link: 'https://www.apple.com/watch/pro/',
        kind: "watch",
      },
    ],
    periphery: [
      {
        name: "Apple Polishing Cloth",
        link: "https://www.apple.com/in/shop/product/MW693ZM/A/polishing-cloth",
        kind: "utility",
      },
      {
        name: "TVSRTR 160 4V SE | Bike",
        kind: "bike",
        link: "https://tvsnepal.com/product/apache-rtr-160-4v-se",
      },
    ],
    essentials: [],

    "personal care": [
      {
        name: "Desert Essence | Charcoal Carrageenan",
        link: "https://www.desertessence.com/products/activated-charcoal-carrageenan-free-toothpaste?srsltid=AfmBOop8iwrclIqbvBi_hlploEZg4MvMMuKpCwe4VlYZXVGLOuYIdKQz",
        kind: "toothpaste",
      },
      {
        name: "Jamun Acne | Face Serum",
        link: "https://www.jamun.in/products/jamun-acne-face-serum",
        kind: "face serum",
      },
      {
        name: "N+ Mositurizer",
        link: "https://www.npluscosmetics.com/products/nplus-mositurizer",
        kind: "moisturizer",
      },
      {
        name: "Garnier | Invisible serum Sunscreen",
        kind: "sunscreen",
      },
    ],
  };

  return (
    <div className="flex max-w-2xl flex-col gap-10 text-left font-sans">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          Things I&apos;m using…
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          About ten years of buying random gadgets and software and slowly
          figuring out what actually stuck. This page is the short version: the
          hardware on my desk, the boring self-care stuff, and the dev stack I
          reach for without thinking.
        </p>
        <p className="text-base text-muted-foreground leading-relaxed">
          None of this is sponsored or aspirational. It&apos;s just the stuff
          that made my day a little easier once I stopped chasing every new
          release.
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-primary text-lg font-mono">Hardware</h2>
          <p className="m-0 text-base leading-relaxed text-muted-foreground">
            Laptops, phones, the messy desk in the photo, earbuds, watch. What
            actually gets used, not what looks good in a spec sheet.
          </p>
        </div>
        <figure className="group m-0 rounded-lg">
          <img
            src="/assets/setup3.jpg"
            alt="Workspace desk setup with monitor and gear"
            loading="lazy"
            decoding="async"
          />
          <figcaption className="px-3 py-2 text-[0.65rem] uppercase tracking-[0.12em] text-muted-foreground border-t border-border bg-muted/20">
            Desk setup
          </figcaption>
        </figure>
        <CatalogList items={items.hardware} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-primary text-lg font-mono">Personal care</h2>
          <p className="m-0 text-base leading-relaxed text-muted-foreground">
            Skin picks that survived my bad experiments. Nothing fancy, just
            things that don&apos;t make my face angry.
          </p>
        </div>
        <CatalogList items={items["personal care"]} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-primary text-lg font-mono">Peripherals</h2>
          <p className="m-0 text-base leading-relaxed text-muted-foreground">
            Random bits: bike, polishing cloth, whatever didn&apos;t fit above.
          </p>
        </div>
        <CatalogList items={items.periphery} />
      </section>

      <DevelopmentSection />
    </div>
  );
}
