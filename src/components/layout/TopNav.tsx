"use client";

import { ChevronLeft, Settings } from "lucide-react";
import { useRouter } from "next/navigation";

type TopNavProps = {
  title: string;
  showBack?: boolean;
};

export function TopNav({ title, showBack = false }: TopNavProps) {
  const router = useRouter();

  return (
    <div className="flex w-full max-w-[343px] items-center gap-3 lg:max-w-none">
      <button
        type="button"
        onClick={() => showBack && router.back()}
        aria-label="Go back"
        className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-gray-100"
      >
        <ChevronLeft className="size-6 text-white" strokeWidth={2.5} />
      </button>
      <h1 className="min-w-0 flex-1 text-center text-xl font-bold tracking-[-0.1px] text-white">
        {title}
      </h1>
      <button
        type="button"
        aria-label="Settings"
        className="flex size-12 shrink-0 items-center justify-center rounded-[18px] bg-gray-100"
      >
        <Settings className="size-6 text-white" strokeWidth={2} />
      </button>
    </div>
  );
}
