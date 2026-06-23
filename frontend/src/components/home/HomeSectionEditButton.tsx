"use client";

import { Pencil } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useHomeSections } from "@/context/HomeSectionsContext";
import type { HomeSectionId } from "@/lib/data/home-sections";

type HomeSectionEditButtonProps = {
  sectionId: HomeSectionId;
  className?: string;
};

export function HomeSectionEditButton({
  sectionId,
  className = "",
}: HomeSectionEditButtonProps) {
  const { isAdmin } = useAuth();
  const { openEditor } = useHomeSections();

  if (!isAdmin) return null;

  return (
    <button
      type="button"
      onClick={() => openEditor(sectionId)}
      aria-label="編輯區塊內容"
      className={`flex size-8 shrink-0 items-center justify-center rounded-[12px] bg-gray-90/90 text-orange-50 shadow-[0_4px_12px_rgba(0,0,0,0.35)] backdrop-blur-sm transition-colors hover:bg-gray-80 ${className}`}
    >
      <Pencil className="size-4" strokeWidth={2.25} />
    </button>
  );
}
