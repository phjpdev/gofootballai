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
import { useI18n } from "@/lib/i18n/LocaleProvider";
import type { Messages } from "@/lib/i18n/messages";
import { cn } from "@/lib/utils";
import { TelegramIcon, TELEGRAM_URL } from "@/components/icons/TelegramIcon";
import { LanguageToggle } from "@/components/layout/LanguageToggle";

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

function navItems(nav: Messages["layout"]["nav"]): NavItem[] {
  return [
    { href: "/home", label: nav.home, icon: Home },
    { href: "/analysis", label: nav.analysis, logo: true, hideLabel: true },
    { href: "/records", label: nav.records, icon: FolderOpen },
    { href: "/member", label: nav.member, icon: Users },
    {
      href: TELEGRAM_URL,
      label: nav.telegram,
      icon: TelegramIcon,
      external: true,
    },
  ];
}

function isNavActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();
  const items = navItems(t.layout.nav);
  const compact = items.length >= 5;

  return (
    <nav
      aria-label={t.layout.nav.mainNavigation}
      className="relative z-50 shrink-0 overflow-visible border-t border-gray-90 bg-black pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_32px_rgba(0,0,0,0.35)] lg:hidden"
    >
      {/* Mobile has no header on most pages, so the switch floats just above the
          nav. /home's pager controls sit there, so its hero carries the switch. */}
      {pathname !== "/home" && (
        <LanguageToggle
          variant="compact"
          className="absolute right-3 bottom-[calc(100%+12px)]"
        />
      )}
      <div className="flex w-full items-end justify-around px-2 py-1">
        {items.map((item) => {
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
