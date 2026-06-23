"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_HOME_SECTIONS,
  homeSectionsById,
  type HomeSection,
  type HomeSectionId,
} from "@/lib/data/home-sections";
import { fetchHomeSections } from "@/lib/home-sections-api";

type HomeSectionsContextValue = {
  sections: Record<HomeSectionId, HomeSection>;
  loading: boolean;
  editingId: HomeSectionId | null;
  openEditor: (id: HomeSectionId) => void;
  closeEditor: () => void;
  refresh: () => Promise<void>;
  updateSection: (section: HomeSection) => void;
};

const HomeSectionsContext = createContext<HomeSectionsContextValue | null>(null);

export function HomeSectionsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sections, setSections] = useState<HomeSection[]>(DEFAULT_HOME_SECTIONS);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<HomeSectionId | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchHomeSections();
      if (data.length > 0) {
        setSections(data);
      }
    } catch {
      setSections(DEFAULT_HOME_SECTIONS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const updateSection = useCallback((section: HomeSection) => {
    setSections((current) =>
      current.map((item) => (item.id === section.id ? section : item)),
    );
  }, []);

  const value = useMemo<HomeSectionsContextValue>(
    () => ({
      sections: homeSectionsById(sections),
      loading,
      editingId,
      openEditor: setEditingId,
      closeEditor: () => setEditingId(null),
      refresh,
      updateSection,
    }),
    [sections, loading, editingId, refresh, updateSection],
  );

  return (
    <HomeSectionsContext.Provider value={value}>
      {children}
    </HomeSectionsContext.Provider>
  );
}

export function useHomeSections() {
  const context = useContext(HomeSectionsContext);
  if (!context) {
    throw new Error("useHomeSections must be used within HomeSectionsProvider");
  }
  return context;
}

export function useHomeSection(id: HomeSectionId) {
  const { sections } = useHomeSections();
  return sections[id];
}
