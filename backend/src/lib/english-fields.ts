/**
 * Optional English overrides on admin-entered content.
 *
 * Absent from the request means "leave what is stored" (older clients and
 * partial updates); present but blank means "clear it", so English readers fall
 * back to the Chinese text again.
 */
export function readEnglishField(
  body: unknown,
  key: string,
): string | null | undefined {
  if (!body || typeof body !== "object" || !(key in body)) return undefined;
  const value = String((body as Record<string, unknown>)[key] ?? "").trim();
  return value || null;
}

export function exceedsLength(
  value: string | null | undefined,
  max: number,
): boolean {
  return typeof value === "string" && value.length > max;
}

/**
 * Append `column = $n` for each English field that was supplied, so omitted
 * fields keep their stored value. Mutates `sets`/`params`.
 */
export function pushEnglishSets(
  sets: string[],
  params: unknown[],
  fields: Array<[column: string, value: string | null | undefined]>,
): void {
  for (const [column, value] of fields) {
    if (value === undefined) continue;
    params.push(value);
    sets.push(`${column} = $${params.length}`);
  }
}
