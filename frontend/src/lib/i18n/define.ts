/**
 * Declare one namespace of UI text in both languages.
 *
 * The Chinese object defines the shape; `en` must match it exactly (missing or
 * extra keys are type errors), so a string can never silently exist in only
 * one language. Values are plain strings or functions for interpolation:
 *
 *   defineMessages({
 *     "zh-HK": { title: "賽事列表", count: (n: number) => `共 ${n} 場` },
 *     en: { title: "Matches", count: (n: number) => `${n} matches` },
 *   });
 */
export function defineMessages<T extends object>(messages: {
  "zh-HK": T;
  en: NoInfer<T>;
}) {
  return messages;
}
