import { Link } from "react-router";
import { createHeaders, createMetaTags } from "~/lib/meta";
import type { Route } from "./+types/route";

type PortfolioEntry = {
  name: string;
  url: string;
  highlighted?: boolean;
};

const portfolios: PortfolioEntry[] = [
  { name: "Zha Yitong", url: "https://zhayitong.com/" },
  { name: "Alex Carpenter", url: "https://alexcarpenter.me/" },
  { name: "Imadil", url: "https://www.imadil.dev/" },
  { name: "Rinkt Adhana", url: "https://www.rinkitadhana.com/" },
  { name: "Jakub Krehel", url: "https://jakub.kr/", highlighted: true },
  { name: "Raphael Salaja", url: "https://www.raphaelsalaja.com/" },
  { name: "Bridger Tower", url: "https://bridger.to/" },
  { name: "Balaj Marius", url: "https://balajmarius.com/bookshelf/" },
  { name: "Paco", url: "https://paco.me/" },
  { name: "Aidan Toole", url: "https://www.aidantoole.com/" },
  { name: "Kaitlyn Son", url: "https://kaitlynson.com/" },
  { name: "Font Mars", url: "https://fonsmans.com/", highlighted: true },
  { name: "Emil Kowal", url: "https://emilkowal.ski/", highlighted: true },
  { name: "Ryo Lu", url: "https://work.ryo.lu/" },
  { name: "Niyas", url: "https://www.niyasv.com/" },
  { name: "Andrea Vollendrof", url: "https://andreavollendorf.com/" },
  { name: "Swapnil Acharya", url: "https://swapnil.com.np/" },
  { name: "Nitish Khagwal", url: "https://khagwal.com/" },
  { name: "Priyanshi", url: "https://hipriyanshi.framer.website/" },
  { name: "Fabricio Teixeira", url: "https://fabricio.work/" },
  { name: "Lukas Guschlbauer", url: "https://www.der-lukas.net/" },
  { name: "Abdu Salam", url: "https://abdussalam.pk/" },
  { name: "Stephanie Bruce", url: "https://stephaniebruce.co/" },
  { name: "Rachel Chen", url: "https://www.rachelchen.tech/" },
  { name: "Dousanmiao", url: "https://www.dousanmiao.com/" },
  { name: "Carl Barenbrug", url: "https://carlbarenbrug.com/" },
  { name: "Samuel Kraft", url: "https://samuelkraft.com/", highlighted: true },
  { name: "Todor Rusanov", url: "https://todorrusanov.com/" },
  { name: "Anh", url: "https://www.pwign.com/" },
  { name: "Brian Lovin", url: "https://brianlovin.com/", highlighted: true },
  { name: "Anthony Fu", url: "https://antfu.me/", highlighted: true },
  { name: "Matteo Fabbiani", url: "https://www.matteofabbiani.com/" },
  { name: "Henry", url: "https://hen-ry.com/" },
  { name: "Yann-Edern Gillet", url: "https://yannglt.com/", highlighted: true },
  { name: "Onur Suyalcinkaya", url: "https://onur.dev/", highlighted: true },
  { name: "Nils", url: "https://nils.io/" },
];

export const handle = {
  breadcrumb: () => <Link to="/portfolio-curation">Sites</Link>,
};

export const meta: Route.MetaFunction = () =>
  createMetaTags({
    title: "Sites",
    description: "Sites I like and revisit. Jump in and love the most.",
    path: "/portfolio-curation",
    keywords: [
      "portfolio inspiration",
      "designer portfolio",
      "well designed websites",
      "portfolio curation",
    ],
  });

export function headers() {
  return createHeaders({
    cacheControl:
      "public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400",
  });
}

function hostnameOf(rawUrl: string): string {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return rawUrl;
  }
}

export default function Page() {
  return (
    <div className="">
      <header className="mb-4">
        <h1 className="font-clash text-2xl font-medium tracking-tight text-foreground">
          Sites
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sites I like, jump in and love the most.
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Rows with a star are highlighted picks.
        </p>
      </header>

      <div className="overflow-x-auto ">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-muted/20 text-muted-foreground">
              <th className="px-4 md:px-6 lg:px-8 xl:px-12 py-2 text-left font-medium text-sm">
                Name
              </th>
              <th className="py-2 pr-4 md:pr-6 lg:pr-8 text-left font-medium">
                Site
              </th>
            </tr>
          </thead>
          <tbody>
            {portfolios.map((item) => (
              <tr
                key={item.url}
                className={[
                  "border-b border-border/40 last:border-b-0 text-sm",
                  item.highlighted
                    ? "bg-muted/20 hover:bg-muted/30"
                    : "hover:bg-muted/10",
                ].join(" ")}
              >
                <td className="px-4 md:px-6 lg:px-8 xl:px-12 py-2.5 pr-4 min-w-[280px] ">
                  <div className="flex min-w-0 items-center gap-3">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="block truncate text-foreground hover:underline underline-offset-4"
                    >
                      {item.name}
                    </a>
                  </div>
                </td>

                <td className="py-2.5 pr-4 md:pr-6 lg:pr-8 text-muted-foreground min-w-[180px]">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block truncate hover:text-foreground hover:underline underline-offset-4"
                  >
                    {hostnameOf(item.url)}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
