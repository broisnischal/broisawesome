import { Link } from "react-router";
import {
  MdLink,
  MdList,
  MdListItem,
  SectionLabel,
  Squiggle,
} from "~/components/terminal";
import { createHeaders, createMetaTags, createPageSchema } from "~/lib/meta";
import type { Route } from "./+types/route";

export const handle = {
  breadcrumb: () => <Link to="/use">use</Link>,
};

const USE_DESCRIPTION =
  "The hardware, software, and dev tools Nischal Dahal (broisnischal) actually uses day to day — editor setup, desk gear, and the stack reached for without thinking.";

export const meta: Route.MetaFunction = () => {
  const metaTags = createMetaTags({
    title: "Uses",
    description: USE_DESCRIPTION,
    path: "/use",
    keywords: [
      "Nischal Dahal",
      "broisnischal",
      "uses",
      "setup",
      "gear",
      "hardware",
      "software",
      "dev tools",
      "desk setup",
    ],
  });
  return [
    ...metaTags,
    createPageSchema({
      title: "Uses — Nischal Dahal",
      description: USE_DESCRIPTION,
      path: "/use",
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: "Uses", path: "/use" },
      ],
      type: "CollectionPage",
    }),
  ];
};

export function headers() {
  return createHeaders();
}

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

/**
 * Bare hostname for the magenta `(…)` link segment. Without this, MdLink falls
 * back to the full href and the rows become a wall of raw URLs.
 */
function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

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
    <MdList className="mt-3 space-y-2">
      {items.map((item) => (
        <MdListItem key={item.name}>
          <span>
            {item.link ? (
              <MdLink
                label={item.name}
                href={item.link}
                display={hostOf(item.link)}
              />
            ) : (
              <span className="text-foreground">{item.name}</span>
            )}
            <span className="text-muted-foreground/70">
              {" "}
              · {formatKindLabel(item.kind)}
            </span>
          </span>
        </MdListItem>
      ))}
    </MdList>
  );
}

function DevSublinkList({ items }: { items: DevSublink[] }) {
  return (
    <MdList className="mt-1.5 ml-2 border-l border-border/40 pl-3">
      {items.map((s) => (
        <MdListItem key={s.label}>
          <MdLink label={s.label} href={s.link} display={hostOf(s.link)} />
        </MdListItem>
      ))}
    </MdList>
  );
}

function DevelopmentSection() {
  return (
    <div className="flex flex-col gap-0">
      <Squiggle />
      <SectionLabel>Development:</SectionLabel>
      <p className="mt-2 text-muted-foreground">
        Editors, browser, a handful of AI tabs, terminal tools, and the design
        apps I open when I&apos;m not just writing code. Honest list, not a
        resume keyword dump.
      </p>

      {developmentSubsections.map((subsection) => (
        <div key={subsection.title}>
          <Squiggle />
          <SectionLabel>{subsection.title}:</SectionLabel>
          <MdList className="mt-3 space-y-4">
            {subsection.items.map((entry) => (
              <MdListItem key={entry.name}>
                <span className="flex flex-col gap-1">
                  <span>
                    {entry.link ? (
                      <MdLink
                        label={entry.name}
                        href={entry.link}
                        display={hostOf(entry.link)}
                      />
                    ) : (
                      <span className="text-foreground">{entry.name}</span>
                    )}
                  </span>
                  {entry.detail ? (
                    <span className="text-muted-foreground/80">
                      {entry.detail}
                    </span>
                  ) : null}
                  {entry.sublinks?.length ? (
                    <DevSublinkList items={entry.sublinks} />
                  ) : null}
                </span>
              </MdListItem>
            ))}
          </MdList>
        </div>
      ))}
    </div>
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
    <div className="w-full text-sm leading-7 md:text-[0.9375rem]">
      <h1 className="text-lg font-medium tracking-tight text-bright">Uses</h1>
      <p className="mt-2 text-muted-foreground">things I&apos;m using.</p>

      <Squiggle />

      <p className="max-w-xl text-muted-foreground">
        About ten years of buying random gadgets and software and slowly
        figuring out what actually stuck. Hardware on my desk, the boring
        self-care stuff, and the dev stack I reach for without thinking. None of
        this is sponsored or aspirational.
      </p>

      <Squiggle />

      <section aria-label="Hardware">
        <SectionLabel>Hardware:</SectionLabel>
        <p className="mt-2 text-muted-foreground">
          Laptops, phones, the messy desk in the photo, earbuds, watch. What
          actually gets used, not what looks good in a spec sheet.
        </p>
        <figure className="m-0 mt-4">
          <img
            src="/assets/setup3.jpg"
            alt="Workspace desk setup with monitor and gear"
            loading="lazy"
            decoding="async"
            className="w-full max-w-sm rounded-md border border-border/60"
          />
          <figcaption className="mt-1 text-xs uppercase tracking-[0.12em] text-muted-foreground">
            desk setup
          </figcaption>
        </figure>
        <CatalogList items={items.hardware} />
      </section>

      <Squiggle />

      <section aria-label="Personal care">
        <SectionLabel>Personal care:</SectionLabel>
        <p className="mt-2 text-muted-foreground">
          Skin picks that survived my bad experiments. Nothing fancy, just
          things that don&apos;t make my face angry.
        </p>
        <CatalogList items={items["personal care"]} />
      </section>

      <Squiggle />

      <section aria-label="Peripherals">
        <SectionLabel>Peripherals:</SectionLabel>
        <p className="mt-2 text-muted-foreground">
          Random bits: bike, polishing cloth, whatever didn&apos;t fit above.
        </p>
        <CatalogList items={items.periphery} />
      </section>

      <DevelopmentSection />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  return (
    <div className="w-full text-sm">
      <SectionLabel>Error:</SectionLabel>
      <p className="mt-2 text-destructive">{error.message}</p>
    </div>
  );
}
