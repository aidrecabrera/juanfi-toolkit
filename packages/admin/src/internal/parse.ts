/** trim splits, drop blanks. not for positional configs (use splitPositional) */
export function splitRows(raw: string): string[] {
  return raw
    .split('|')
    .map((row) => row.trim())
    .filter((row) => row.length > 0);
}

/** raw.split('|'). keeps empty slots, index is the contract */
export function splitPositional(raw: string): string[] {
  return raw.split('|');
}

/** hash columns inside one pipe row */
export function splitColumns(row: string): string[] {
  return row.split('#').map((value) => value.trim());
}

/** URLSearchParams on a raw k=v&k=v string */
export function parseFormEncoded(raw: string): Record<string, string> {
  const result: Record<string, string> = {};
  const params = new URLSearchParams(raw);
  for (const [key, value] of params) result[key] = value;
  return result;
}

/** int from positional slot, blank or junk uses fallback (same spirit as firmware SystemConfig::getInt) */
export function readFieldInt(fields: readonly string[], index: number, fallback = 0): number {
  const value = fields[index];
  if (value === undefined || value === '') return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function readFieldString(fields: readonly string[], index: number): string {
  return fields[index] ?? '';
}

export function padFields(fields: readonly string[], length: number): string[] {
  const out = fields.slice() as string[];
  while (out.length < length) out.push('');
  if (out.length > length) out.length = length;
  return out;
}

/** join for wire format, doesn't trim. empty slots round-trip */
export function joinFields(fields: readonly string[], separator = '|'): string {
  return fields.join(separator);
}
