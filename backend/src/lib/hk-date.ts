export function getTodayDateKeyHk(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(new Date());
}

export function dateKeyFromKickOff(kickOffTime: string): string | null {
  const date = new Date(kickOffTime);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(date);
}
