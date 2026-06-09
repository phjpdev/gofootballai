import { notFound } from "next/navigation";
import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import {
  fetchHkjcMatchById,
  hkjcMatchToLegacy,
} from "@/lib/hkjc/fetch-matches";
import { getMatchById } from "@/lib/data/matches";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MatchAnalysisPage({ params }: Props) {
  const { id } = await params;

  const hkjcMatch = await fetchHkjcMatchById(id);
  if (hkjcMatch) {
    return <MatchAnalysisView match={hkjcMatchToLegacy(hkjcMatch)} />;
  }

  const fallback = getMatchById(id);
  if (!fallback) {
    notFound();
  }

  return <MatchAnalysisView match={fallback} />;
}
