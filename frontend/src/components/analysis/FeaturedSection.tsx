"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import { AnimateIn } from "@/components/motion/AnimateIn";
import { FeaturedMatchCard } from "@/components/cards/FeaturedMatchCard";
import { EditFeaturedModal } from "@/components/analysis/EditFeaturedModal";
import { SubNav } from "@/components/layout/SubNav";
import { useAuth } from "@/context/AuthContext";
import { FEATURED_COUNT, FEATURED_ITEMS } from "@/lib/data/featured";
import { fetchFeaturedItems } from "@/lib/featured-api";
import type { FeaturedItem } from "@/lib/data/featured";

export function FeaturedSection() {
  const { token, isAdmin } = useAuth();
  const [items, setItems] = useState<FeaturedItem[]>(FEATURED_ITEMS);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const loadItems = useCallback(async () => {
    try {
      const data = await fetchFeaturedItems();
      if (data.length > 0) {
        setItems(data);
      }
    } catch {
      setItems(FEATURED_ITEMS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  return (
    <section className="flex flex-col gap-2">
      <SubNav
        title="精選賽事"
        count={FEATURED_COUNT}
        seeAllHref="/analysis?picks=top"
        titleAction={
          isAdmin ? (
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              aria-label="編輯精選賽事"
              className="flex size-8 shrink-0 items-center justify-center rounded-[12px] bg-gray-90 text-orange-50 transition-colors hover:bg-gray-80"
            >
              <Pencil className="size-4" strokeWidth={2.25} />
            </button>
          ) : undefined
        }
      />

      <div className="perspective-[1200px] scrollbar-hide -mx-4 flex gap-2 overflow-x-auto px-4 [touch-action:pan-x] lg:mx-0 lg:px-0 lg:[touch-action:auto]">
        {loading
          ? Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="h-[225px] w-[261px] shrink-0 animate-pulse rounded-[20px] bg-gray-90"
              />
            ))
          : items.map((item, index) => (
              <AnimateIn
                key={item.id}
                variant="flip"
                delay={index * 220}
                className="shrink-0"
              >
                <FeaturedMatchCard {...item} />
              </AnimateIn>
            ))}
      </div>

      {isAdmin && token && (
        <EditFeaturedModal
          open={modalOpen}
          items={items}
          token={token}
          onClose={() => setModalOpen(false)}
          onSaved={setItems}
        />
      )}
    </section>
  );
}
