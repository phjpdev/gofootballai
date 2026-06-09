import { notFound } from "next/navigation";
import { MatchAnalysisView } from "@/components/analysis/MatchAnalysisView";
import { getMatchById } from "@/lib/data/matches";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MatchAnalysisPage({ params }: Props) {
  const { id } = await params;
  const match = getMatchById(id);

  if (!match) {
    notFound();
  }

  return <MatchAnalysisView match={match} />;
}
