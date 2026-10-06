/**
 * Grid-line primitives. Pages sit inside a framed column (root.tsx draws the
 * rails); these pieces bleed through the page padding so every band and table
 * row runs rail to rail, the way a data grid does.
 */
import type { ReactNode } from "react";
import { SectionLabel } from "~/components/terminal";
import { cn } from "~/lib/utils";

/** Undo the page padding from layout.tsx so a band touches both rails. */
export const BLEED = "-mx-5 md:-mx-8";
/** Re-apply it inside a band so text lines up with the rest of the page. */
export const INSET = "px-5 md:px-8";

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * A labelled band: hairline on top with a + at each rail, a header row with
 * the section name and an optional count on the trailing edge, then content.
 */
export function GridSection({
  title,
  meta,
  children,
  className,
  bare,
}: {
  title: string;
  meta?: ReactNode;
  children: ReactNode;
  className?: string;
  /** No header bar: the title is kept for screen readers only. */
  bare?: boolean;
}) {
  const id = slugify(title);
  if (bare) {
    return (
      <section
        aria-labelledby={id}
        className={cn(
          "grid-cross relative border-t border-border",
          BLEED,
          className,
        )}
      >
        <SectionLabel id={id} className="sr-only">
          {title}
        </SectionLabel>
        {children}
      </section>
    );
  }
  return (
    <section
      aria-labelledby={id}
      className={cn(
        "grid-cross relative border-t border-border",
        BLEED,
        className,
      )}
    >
      <div
        className={cn(
          "flex min-h-11 items-center justify-between gap-4 border-b border-border",
          INSET,
        )}
      >
        <SectionLabel id={id}>{title}</SectionLabel>
        {meta && (
          <span className="text-xs tabular-nums text-muted-foreground">
            {meta}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

export type GridColumn<T> = {
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  /** Applied to both the header and body cells of this column. */
  className?: string;
  /** Only shown from `sm` up; fold its content into another cell for phones. */
  wide?: boolean;
  align?: "start" | "end";
};

/**
 * A real `<table>`: header row, hairline between rows and cells, row hover.
 * Give one cell a link with the `ROW_LINK` class to make the whole row
 * clickable; other controls in the row need `relative z-10` to stay on top.
 */
export function GridTable<T>({
  label,
  columns,
  rows,
  rowKey,
}: {
  /** Read out as the table caption; not shown. */
  label: string;
  columns: GridColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}) {
  const cellClass = (c: GridColumn<T>) =>
    cn(
      "border-e border-border px-3 last:border-e-0 first:ps-5 last:pe-5 md:first:ps-8 md:last:pe-8",
      c.wide && "hidden sm:table-cell",
      c.align === "end" ? "text-end" : "text-start",
      c.className,
    );

  return (
    <div className="overflow-x-auto">
      {/* Fixed layout: columns take their declared widths, so stacked tables
          on one page line up column for column. */}
      <table className="w-full table-fixed border-collapse">
        <caption className="sr-only">{label}</caption>
        <thead>
          <tr className="border-b border-border">
            {columns.map((c, i) => (
              <th
                key={i}
                scope="col"
                className={cn(
                  cellClass(c),
                  "py-2 text-xs font-normal text-muted-foreground",
                )}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr
              key={rowKey(row)}
              className="group/row relative border-b border-border transition-colors last:border-b-0 hover:bg-muted"
            >
              {columns.map((c, ci) => (
                <td
                  key={ci}
                  className={cn(
                    cellClass(c),
                    "py-2.5 align-top [overflow-wrap:anywhere]",
                  )}
                >
                  {c.cell(row, ri)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Stretches a cell's link over its whole row (the row is `relative`). */
export const ROW_LINK =
  "after:absolute after:inset-0 after:content-[''] rounded-xs";

/** Two-digit row number, like a grid's gutter. */
export function RowNumber({ n }: { n: number }) {
  return (
    <span className="text-xs whitespace-nowrap tabular-nums text-muted-foreground">
      {String(n).padStart(2, "0")}
    </span>
  );
}

/**
 * A box of cells, hairlines between every cell: 1 column on phones, 2 from
 * `sm`, 3 from `lg`. The lines are the 1px gaps showing the border colour
 * through, so empty slots in a short last row are filled with blank cells
 * (otherwise they'd show as solid border-coloured blocks).
 */
export function GridCells<T>({
  items,
  cellKey,
  renderCell,
  label,
}: {
  items: T[];
  cellKey: (item: T) => string;
  renderCell: (item: T, index: number) => ReactNode;
  label: string;
}) {
  const n = items.length;
  const smFill = (2 - (n % 2)) % 2;
  const lgFill = (3 - (n % 3)) % 3;
  const fillers = Math.max(smFill, lgFill);

  return (
    <ul
      aria-label={label}
      className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3"
    >
      {items.map((item, i) => (
        <li
          key={cellKey(item)}
          data-tile
          className="group/row relative flex bg-background"
        >
          {renderCell(item, i)}
        </li>
      ))}
      {Array.from({ length: fillers }, (_, i) => (
        <li
          key={`filler-${i}`}
          data-tile
          aria-hidden
          className={cn(
            "hidden bg-background",
            i < smFill ? "sm:block" : "sm:hidden",
            i < lgFill ? "lg:block" : "lg:hidden",
          )}
        />
      ))}
    </ul>
  );
}
