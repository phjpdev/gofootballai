/** Format HKJC handicap condition for display, e.g. "-1.0" → "-1", "-0.5/-1.0" → "-0.5/-1" */
export function formatHandicapLine(condition: string): string {
  return condition
    .split("/")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return part;
      const num = Number.parseFloat(trimmed);
      if (Number.isNaN(num)) return trimmed;
      if (Number.isInteger(num)) {
        const sign = num > 0 ? "+" : num < 0 ? "-" : "";
        return `${sign}${Math.abs(num)}`;
      }
      return trimmed;
    })
    .join("/");
}

/** Flip home handicap to away side, e.g. "-0.5/-1.0" → "+0.5/+1.0" */
export function flipHandicapLine(condition: string): string {
  return condition
    .split("/")
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return part;
      if (trimmed.startsWith("+")) return trimmed.replace("+", "-");
      if (trimmed.startsWith("-")) return trimmed.replace("-", "+");
      if (trimmed === "0" || trimmed === "0.0") return trimmed;
      return `+${trimmed}`;
    })
    .join("/");
}

export function bracketHandicapLine(condition: string): string {
  return `[${formatHandicapLine(condition)}]`;
}
