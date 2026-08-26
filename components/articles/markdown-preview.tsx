"use client";

import React from "react";

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
  const renderLines = () => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let inList = false;
    let listItems: string[] = [];

    const flushTable = (key: number) => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const rows = tableRows.slice(1);
        elements.push(
          <div key={"table-" + key} className="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold border-b">
                <tr>
                  {header.map((th, i) => (
                    <th key={i} className="py-2.5 px-3">
                      {th.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-2 px-3 text-slate-700 dark:text-slate-300">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
      }
      inTable = false;
    };

    const flushList = (key: number) => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={"list-" + key} className="my-2 space-y-1 pl-5 list-disc text-xs text-slate-700 dark:text-slate-300">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        listItems = [];
      }
      inList = false;
    };

    const formatInline = (str: string) => {
      return str
        .replace(/\*\*(.*?)\*\*/g, "<strong class='font-bold text-slate-900 dark:text-white'>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em class='italic text-slate-500'>$1</em>")
        .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' class='text-blue-600 dark:text-blue-400 font-medium underline hover:text-blue-700'>$1</a>")
        .replace(/`([^`]+)`/g, "<code class='bg-slate-100 dark:bg-slate-800 text-purple-600 px-1 py-0.5 rounded font-mono text-xs'>$1</code>");
    };

    lines.forEach((line, idx) => {
      const trimmed = line.trim();

      // Table line
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (inList) flushList(idx);
        // Ignore separator line like |---|---|
        const stripped = trimmed.replace(/\|/g, "").replace(/-/g, "").replace(/:/g, "").trim();
        if (stripped.length === 0) {
          return;
        }
        const cells = trimmed
          .slice(1, -1)
          .split("|")
          .map((c) => c.trim());
        tableRows.push(cells);
        inTable = true;
        return;
      } else if (inTable) {
        flushTable(idx);
      }

      // Unordered list item
      if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        listItems.push(trimmed.slice(2));
        inList = true;
        return;
      } else if (inList) {
        flushList(idx);
      }

      // Image markdown: ![alt](url)
      if (trimmed.startsWith("![") && trimmed.includes("](") && trimmed.endsWith(")")) {
        const alt = trimmed.slice(2, trimmed.indexOf("]("));
        const src = trimmed.slice(trimmed.indexOf("](") + 2, -1);
        elements.push(
          <div key={"img-" + idx} className="my-5 rounded-2xl overflow-hidden shadow-md border border-slate-200/80 dark:border-slate-800 bg-slate-100 dark:bg-slate-800">
            <img
              src={src}
              alt={alt}
              className="w-full max-h-[420px] object-cover hover:scale-[1.01] transition-transform duration-300"
              loading="lazy"
            />
          </div>
        );
        return;
      }

      // Headings
      if (trimmed.startsWith("# ")) {
        elements.push(
          <h1 key={"h1-" + idx} className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-6 mb-3">
            {trimmed.slice(2)}
          </h1>
        );
        return;
      }
      if (trimmed.startsWith("## ")) {
        elements.push(
          <h2 key={"h2-" + idx} className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight mt-6 mb-2 border-b pb-1.5 border-slate-200 dark:border-slate-800 flex items-center gap-2">
            {trimmed.slice(3)}
          </h2>
        );
        return;
      }
      if (trimmed.startsWith("### ")) {
        elements.push(
          <h3 key={"h3-" + idx} className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-4 mb-1.5">
            {trimmed.slice(4)}
          </h3>
        );
        return;
      }

      // Blockquote
      if (trimmed.startsWith("> ")) {
        elements.push(
          <blockquote
            key={"bq-" + idx}
            className="my-3 pl-4 border-l-4 border-blue-500 bg-blue-50/60 dark:bg-blue-950/40 py-2 rounded-r-lg text-xs italic text-blue-950 dark:text-blue-200"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed.slice(2)) }}
          />
        );
        return;
      }

      // Horizontal rule
      if (trimmed === "---" || trimmed === "***") {
        elements.push(<hr key={"hr-" + idx} className="my-5 border-slate-200 dark:border-slate-800" />);
        return;
      }

      // Empty line
      if (!trimmed) {
        return;
      }

      // Regular paragraph
      elements.push(
        <p
          key={"p-" + idx}
          className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed my-2"
          dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
        />
      );
    });

    if (inTable) flushTable(lines.length);
    if (inList) flushList(lines.length);

    return elements;
  };

  return <div className="space-y-1 text-xs">{renderLines()}</div>;
}
