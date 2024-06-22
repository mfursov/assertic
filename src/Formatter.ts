export function formatValue(value: unknown): string {
  return value === undefined
    ? '<undefined>'
    : typeof value === 'symbol'
      ? value.toString()
      : value === null
        ? '<null>'
        : `<${typeof value}:${value}>`;
}
