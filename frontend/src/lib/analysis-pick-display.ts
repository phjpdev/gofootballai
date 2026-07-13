/** Swap 大/小 for over/under picks shown on analysis pages. */
export function flipOverUnderPickSelection(selection: string): string {
  const normalized = selection.trim();
  if (normalized.startsWith("大")) {
    return `小${normalized.slice(1)}`;
  }
  if (normalized.startsWith("小")) {
    return `大${normalized.slice(1)}`;
  }
  return selection;
}
