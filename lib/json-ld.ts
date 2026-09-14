/**
 * Safely serializes an object for embedding via
 * `<script type="application/ld+json" dangerouslySetInnerHTML={...} />`.
 *
 * `JSON.stringify` alone is not safe to drop into HTML this way: if any
 * string value in the data contains the literal sequence `</script>` (or
 * `<!--`), the browser's HTML parser ends the script element early and
 * treats whatever follows as raw markup — a real injection vector, not a
 * theoretical one. This escapes the handful of characters that matter for
 * that specific parsing behavior without corrupting the JSON.
 *
 * Every component that renders JSON-LD should use this rather than calling
 * JSON.stringify directly, even when the data currently comes only from
 * admin-controlled fields — admin input today doesn't guarantee it always
 * will, and this costs nothing to apply universally.
 */
export function safeJsonLd(data: unknown): { __html: string } {
  const json = JSON.stringify(data) ?? 'null';
  const escaped = json.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  return { __html: escaped };
}
