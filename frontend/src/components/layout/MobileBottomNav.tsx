"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FolderOpen,
  Home,
  Users,
  type LucideIcon,
} from "lucide-react";
import { NAV } from "@/lib/i18n/zh-hk";
import { cn } from "@/lib/utils";

const TELEGRAM_URL = "https://t.me/gofootballai";

type NavIcon = LucideIcon | typeof TelegramIcon;

type NavItem =
  | {
      href: string;
      label: string;
      icon: NavIcon;
      logo?: false;
      external?: boolean;
      hideLabel?: boolean;
    }
  | { href: string; label: string; logo: true; hideLabel?: boolean; icon?: never; external?: false };

function TelegramIcon({
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

const NAV_ITEMS: NavItem[] = [
  { href: "/home", label: NAV.home, icon: Home },
  { href: "/analysis", label: NAV.analysis, logo: true, hideLabel: true },
  { href: "/records", label: NAV.records, icon: FolderOpen },
  { href: "/member", label: NAV.member, icon: Users },
  {
    href: TELEGRAM_URL,
    label: NAV.telegram,
    icon: TelegramIcon,
    external: true,
  },
];

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const compact = NAV_ITEMS.length >= 5;

  return (
    <nav
      aria-label="主要導覽"
      className="z-50 shrink-0 overflow-visible border-t border-gray-90 bg-black pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_32px_rgba(0,0,0,0.35)] lg:hidden"
    >
      <div className="flex w-full items-end justify-around px-2 py-1">
        {NAV_ITEMS.map((item) => {
          const { href, label } = item;
          const isExternal = "external" in item && item.external;
          const isActive = !isExternal && isNavActive(pathname, href);
          const isLogoItem = "logo" in item && item.logo;

          const className = cn(
            "flex min-h-0 min-w-0 flex-1 flex-col items-center justify-end",
            compact ? "gap-0.5 px-0.5" : "gap-1 px-1",
            isActive ? "text-orange-50" : "text-gray-40",
          );

          const Icon = "icon" in item ? item.icon : null;

          const hideLabel = "hideLabel" in item && item.hideLabel;

          const content = (
            <>
              <span className="flex h-6 w-full items-end justify-center">
                {isLogoItem ? (
                  <Image
                    src="/images/go-football-logo-nav.png"
                    alt=""
                    width={56}
                    height={56}
                    aria-hidden
                    className={cn(
                      "size-14 shrink-0 rounded-t-full rounded-br-none rounded-bl-none bg-black object-cover object-bottom",
                      isActive ? "opacity-100" : "opacity-70",
                    )}
                  />
                ) : Icon ? (
                  <Icon
                    className={compact ? "size-[18px]" : "size-5"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                ) : null}
              </span>
              {!hideLabel && (
                <span
                  className={cn(
                    "w-full truncate text-center font-medium leading-none",
                    compact ? "text-[9px] leading-tight" : "text-[10px] leading-tight",
                  )}
                >
                  {label}
                </span>
              )}
            </>
          );

          if (isExternal) {
            return (
              <a
                key={href}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={className}
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={href} href={href} aria-label={label} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
