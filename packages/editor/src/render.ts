import type { AppPartialBlock } from "./schema";

/**
 * Render a BlockNote document to a clean, semantic HTML string on the server.
 *
 * Uses `blocksToHTMLLossy` (export-oriented) so the output is semantic markup
 * (`<h2>`, `<aside class="callout">`, `<table>`…) that the user web styles with
 * its own `content.css` — lighter than the full editor DOM and good for SEO.
 *
 * Everything is loaded via dynamic import so the heavy editor runtime never
 * runs at module-evaluation time (e.g. during Next's static page-data
 * collection) — only when a page is actually rendered.
 */
export async function renderContentToHTML(
  blocks: AppPartialBlock[],
): Promise<string> {
  const [{ ServerBlockNoteEditor }, { schema }] = await Promise.all([
    import("@blocknote/server-util"),
    import("./schema"),
  ]);
  const editor = ServerBlockNoteEditor.create({ schema });
  return editor.blocksToHTMLLossy(blocks);
}
