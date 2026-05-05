"use client";

export type TableExportFormat = "CSV" | "Excel" | "PDF";

export type TableExportColumn<T> = {
  label: string;
  value: (row: T) => unknown;
};

type ExportTableOptions<T> = {
  title: string;
  filename: string;
  format: TableExportFormat;
  columns: TableExportColumn<T>[];
  rows: T[];
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const toCellString = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map((item): string => toCellString(item)).join(", ");
  }

  return String(value);
};

const buildMatrix = <T,>(columns: TableExportColumn<T>[], rows: T[]) => ({
  headers: columns.map((column) => column.label),
  values: rows.map((row) => columns.map((column) => toCellString(column.value(row)))),
});

const downloadBlob = (filename: string, type: string, content: string) => {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();

  window.setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 0);
};

const buildTableHtml = (title: string, headers: string[], rows: string[][]) => {
  const headerHtml = headers
    .map(
      (header) =>
        `<th style="padding:12px 14px;border:1px solid #d9dde5;background:#f7f9fc;text-align:left;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#526071;">${escapeHtml(header)}</th>`,
    )
    .join("");

  const bodyHtml = rows
    .map(
      (row) =>
        `<tr>${row
          .map(
            (cell) =>
              `<td style="padding:12px 14px;border:1px solid #d9dde5;font-size:14px;color:#182230;vertical-align:top;">${escapeHtml(cell)}</td>`,
          )
          .join("")}</tr>`,
    )
    .join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="font-family:Inter,Arial,sans-serif;background:#ffffff;color:#182230;padding:32px;">
    <h1 style="margin:0 0 20px;font-size:28px;">${escapeHtml(title)}</h1>
    <p style="margin:0 0 24px;color:#526071;">Generated ${escapeHtml(new Date().toLocaleString())}</p>
    <table style="width:100%;border-collapse:collapse;border-spacing:0;">
      <thead>
        <tr>${headerHtml}</tr>
      </thead>
      <tbody>
        ${bodyHtml}
      </tbody>
    </table>
  </body>
</html>`;
};

const exportCsv = (filename: string, headers: string[], rows: string[][]) => {
  const csv = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((cell) => `"${cell.replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");

  downloadBlob(`${filename}.csv`, "text/csv;charset=utf-8;", csv);
};

const exportExcel = (filename: string, title: string, headers: string[], rows: string[][]) => {
  const html = buildTableHtml(title, headers, rows);
  downloadBlob(
    `${filename}.xls`,
    "application/vnd.ms-excel;charset=utf-8;",
    html,
  );
};

const sanitizePdfText = (value: string) =>
  value
    .replace(/[^\x20-\x7E]/g, "?")
    .replaceAll("\\", "\\\\")
    .replaceAll("(", "\\(")
    .replaceAll(")", "\\)");

const wrapPdfLine = (line: string, maxLength: number) => {
  if (line.length <= maxLength) return [line];

  const words = line.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLength) {
      current = next;
      return;
    }

    if (current) {
      lines.push(current);
    }

    if (word.length <= maxLength) {
      current = word;
      return;
    }

    for (let index = 0; index < word.length; index += maxLength) {
      lines.push(word.slice(index, index + maxLength));
    }
    current = "";
  });

  if (current) {
    lines.push(current);
  }

  return lines;
};

const buildPdfLines = (title: string, headers: string[], rows: string[][]) => {
  const lines = [
    title,
    `Generated ${new Date().toLocaleString()}`,
    `Rows ${rows.length}`,
    "",
    headers.join(" | "),
    "-".repeat(Math.min(headers.join(" | ").length, 132)),
  ];

  rows.forEach((row, rowIndex) => {
    if (rowIndex > 0) {
      lines.push("");
    }

    const rowLines = headers.flatMap((header, columnIndex) =>
      wrapPdfLine(`${header}: ${row[columnIndex] ?? ""}`, 120),
    );

    lines.push(...rowLines);
  });

  return lines.flatMap((line) => wrapPdfLine(line, 132));
};

const buildPdfDocument = (title: string, headers: string[], rows: string[][]) => {
  const pageWidth = 842;
  const pageHeight = 595;
  const margin = 36;
  const fontSize = 9;
  const titleFontSize = 16;
  const lineHeight = 13;
  const maxBodyLines = 37;
  const fontObjectId = 3;
  const lines = buildPdfLines(title, headers, rows);
  const pages: string[][] = [];

  for (let index = 0; index < lines.length; index += maxBodyLines) {
    pages.push(lines.slice(index, index + maxBodyLines));
  }

  if (pages.length === 0) {
    pages.push([]);
  }

  const pageRefs = pages.map((_, index) => ({
    pageId: 4 + index * 2,
    contentId: 5 + index * 2,
  }));
  const objects: string[] = [];

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] =
    `<< /Type /Pages /Kids [${pageRefs
      .map((page) => `${page.pageId} 0 R`)
      .join(" ")}] /Count ${pageRefs.length} >>`;
  objects[2] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  pages.forEach((pageLines, pageIndex) => {
    const { pageId, contentId } = pageRefs[pageIndex];
    const contentLines = [
      "BT",
      `/F1 ${titleFontSize} Tf`,
      `1 0 0 1 ${margin} ${pageHeight - margin} Tm`,
      `(${sanitizePdfText(title)}) Tj`,
      `/F1 ${fontSize} Tf`,
    ];

    pageLines.forEach((line, lineIndex) => {
      const y = pageHeight - margin - 28 - lineIndex * lineHeight;
      contentLines.push(`1 0 0 1 ${margin} ${y} Tm`);
      contentLines.push(`(${sanitizePdfText(line)}) Tj`);
    });

    contentLines.push("ET");

    const stream = contentLines.join("\n");
    const length = new TextEncoder().encode(stream).length;

    objects[pageId - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentId} 0 R >>`;
    objects[contentId - 1] = `<< /Length ${length} >>\nstream\n${stream}\nendstream`;
  });

  const chunks = ["%PDF-1.4\n"];
  const offsets = [0];

  objects.forEach((objectBody, index) => {
    offsets[index + 1] = new TextEncoder().encode(chunks.join("")).length;
    chunks.push(`${index + 1} 0 obj\n${objectBody}\nendobj\n`);
  });

  const xrefOffset = new TextEncoder().encode(chunks.join("")).length;
  chunks.push(`xref\n0 ${objects.length + 1}\n`);
  chunks.push("0000000000 65535 f \n");

  for (let index = 1; index <= objects.length; index += 1) {
    chunks.push(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }

  chunks.push(
    `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
  );

  return chunks.join("");
};

const exportPdf = (filename: string, title: string, headers: string[], rows: string[][]) => {
  const pdf = buildPdfDocument(title, headers, rows);
  downloadBlob(`${filename}.pdf`, "application/pdf", pdf);
};

export const exportTableData = <T,>({
  title,
  filename,
  format,
  columns,
  rows,
}: ExportTableOptions<T>) => {
  const { headers, values } = buildMatrix(columns, rows);

  if (format === "CSV") {
    exportCsv(filename, headers, values);
    return;
  }

  if (format === "Excel") {
    exportExcel(filename, title, headers, values);
    return;
  }

  exportPdf(filename, title, headers, values);
};
