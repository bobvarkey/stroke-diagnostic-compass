import type { IvtBlock, TextRun } from "@/lib/ivtAis";
import { IVT_AIS_BLOCKS } from "@/lib/ivtAis";

function Runs({ runs }: { runs: TextRun[] }) {
  return (
    <>
      {runs.map((run, index) =>
        run.strong ? (
          <strong key={index} className="font-semibold">
            {run.text}
          </strong>
        ) : (
          <span key={index}>{run.text}</span>
        ),
      )}
    </>
  );
}

function DataTable({ headers, rows }: { headers: TextRun[][]; rows: TextRun[][][] }) {
  return (
    <div className="min-w-0">
      <div className="space-y-2 sm:hidden">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="min-w-0 space-y-3 rounded-lg border border-border px-3 py-3">
            {row.map((cell, cellIndex) => (
              <div key={cellIndex} className="min-w-0">
                <div className="mb-1 text-xs font-medium text-muted-foreground break-words">
                  <Runs runs={headers[cellIndex] ?? []} />
                </div>
                <div className="text-sm leading-6 break-words text-pretty">
                  <Runs runs={cell} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="hidden min-w-0 overflow-hidden rounded-lg border border-border sm:block">
        <table className="w-full table-fixed border-collapse text-left text-sm">
          <thead>
            <tr className="bg-muted/50">
              {headers.map((header, index) => (
                <th
                  key={index}
                  scope="col"
                  className="px-3 py-2 align-bottom font-medium text-foreground break-words"
                >
                  <Runs runs={header} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-border">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-3 align-top leading-6 break-words text-pretty">
                    <Runs runs={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BlockView({ block }: { block: IvtBlock }) {
  if (block.kind === "heading" && block.level === 3) {
    return <h4 className="pt-1 text-sm font-semibold leading-snug sm:text-[15px]">{block.text}</h4>;
  }
  if (block.kind === "paragraph") {
    return (
      <p className="text-sm leading-6 break-words text-pretty sm:text-[15px]">
        <Runs runs={block.runs} />
      </p>
    );
  }
  if (block.kind === "list") {
    return (
      <ul className="list-disc space-y-2 pl-5 text-sm leading-6 marker:text-foreground/70 sm:text-[15px]">
        {block.items.map((item, index) => (
          <li key={index} className="min-w-0 break-words pl-1 text-pretty">
            <Runs runs={item} />
          </li>
        ))}
      </ul>
    );
  }
  if (block.kind === "table") {
    return <DataTable headers={block.headers} rows={block.rows} />;
  }
  return null;
}

function sectionsAfterTitle(blocks: IvtBlock[]) {
  const sections: { heading: string; blocks: IvtBlock[] }[] = [];
  for (const block of blocks) {
    if (block.kind === "title") continue;
    if (block.kind === "heading" && block.level === 2) {
      sections.push({ heading: block.text, blocks: [] });
      continue;
    }
    sections[sections.length - 1]?.blocks.push(block);
  }
  return sections;
}

export default function IVThrombolysisAis() {
  const title = IVT_AIS_BLOCKS.find((block) => block.kind === "title");
  const sections = sectionsAfterTitle(IVT_AIS_BLOCKS);

  return (
    <article className="min-w-0 rounded-xl border border-border bg-card text-card-foreground">
      <div className="px-4 py-5 sm:px-6 sm:py-6">
        <h2 className="text-xl font-semibold leading-snug tracking-tight text-balance sm:text-2xl">
          {title?.kind === "title" ? title.text : ""}
        </h2>
        <div className="mt-6 space-y-8">
          {sections.map((section, index) => (
            <section
              key={section.heading}
              className={index === 0 ? "min-w-0 space-y-3" : "min-w-0 space-y-3 border-t border-border pt-8"}
            >
              <h3 className="text-base font-semibold leading-snug sm:text-lg">{section.heading}</h3>
              <div className="min-w-0 space-y-4">
                {section.blocks.map((block, blockIndex) => (
                  <BlockView key={blockIndex} block={block} />
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
