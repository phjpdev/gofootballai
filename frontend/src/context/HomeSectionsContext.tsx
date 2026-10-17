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
  localizeHomeSection,
  type HomeSection,
  type HomeSectionId,
  type LocalizedHomeSection,
} from "@/lib/data/home-sections";
import { fetchHomeSections } from "@/lib/home-sections-api";
import { useI18n } from "@/lib/i18n/LocaleProvider";

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

/** The section's text in the reader's language, for rendering. */
export function useLocalizedHomeSection(
  id: HomeSectionId,
): LocalizedHomeSection {
  const section = useHomeSection(id);
  const { locale } = useI18n();
  return useMemo(() => localizeHomeSection(section, locale), [section, locale]);
}
