import { MatchAnalysisPageClient } from "@/components/analysis/MatchAnalysisPageClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MatchAnalysisPage({ params }: Props) {
  const { id } = await params;
  return <MatchAnalysisPageClient matchId={id} />;
}
