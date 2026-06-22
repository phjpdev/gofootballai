export const TELEGRAM_URL = "https://t.me/gofootballai";

export function TelegramIcon({
  className,
}: {
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M9.417 15.181l-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931L23.93 3.821c.321-1.496-.541-2.081-1.5-1.687L1.114 9.978c-1.453.564-1.433 1.374-.247 1.741l5.443 1.693L18.953 5.78c.595-.394 1.136-.176.691.218" />
    </svg>
  );
}
