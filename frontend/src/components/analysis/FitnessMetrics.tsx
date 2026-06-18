import { figmaAsset } from "@/lib/figma-assets";
import type {
  AnalysisDimensions,
  AnalysisGoalProbabilities,
  AnalysisPick,
} from "@/types/analysis";

const MATCH_MINUTES = ["15'", "30'", "45'", "60'", "75'", "90'"] as const;
const CHEVRON = figmaAsset("44fa759040c464414aab1abfac01547773dd8246");

function SectionHeader() {
  return (
    <div className="flex h-[22px] w-full items-center gap-4">
      <p className="min-w-0 flex-1 text-base font-bold leading-[22px] tracking-[-0.112px] text-white">
        賽事數據
      </p>
      <button
        type="button"
        className="shrink-0 text-sm font-medium leading-5 tracking-[-0.084px] text-[#f97316]"
      >
        查看全部
      </button>
    </div>
  );
}

function CardHeader({
  iconSrc,
  iconInset,
  title,
}: {
  iconSrc: string;
  iconInset: string;
  title: string;
}) {
  return (
    <div className="flex w-full items-center gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-1.5">
        <div className="relative size-5 shrink-0">
          <div className={`absolute ${iconInset}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={figmaAsset(iconSrc)}
              className="block size-full max-w-none"
            />
          </div>
        </div>
        <p className="min-w-0 flex-1 text-base font-semibold leading-[22px] tracking-[-0.112px] text-white">
          {title}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <p className="text-sm font-normal leading-5 tracking-[-0.084px] text-[#d4d4d8]">
          本場
        </p>
        <div className="relative size-5">
          <div className="absolute inset-[12.84%_28.44%_12.84%_31.69%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={CHEVRON}
              className="absolute inset-0 block size-full max-w-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ValueBlock({
  value,
  unit,
  subtitle,
}: {
  value: string;
  unit: string;
  subtitle: string;
}) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="flex items-end gap-0.5">
        <p className="text-2xl font-bold leading-8 tracking-[-0.288px] text-white">
          {value}
        </p>
        <div className="flex flex-col justify-center pb-0.5">
          <p className="text-base font-medium leading-[22px] tracking-[-0.112px] text-white">
            {unit}
          </p>
        </div>
      </div>
      <p className="text-sm font-normal leading-5 tracking-[-0.084px] text-[#d4d4d8]">
        {subtitle}
      </p>
    </div>
  );
}

function WeightBar({ fillPercent }: { fillPercent: number }) {
  const fillRight = `${100 - Math.min(100, Math.max(8, fillPercent))}%`;
  return (
    <div className="flex h-10 w-2 items-center justify-center">
      <div className="-rotate-90 flex-none">
        <div className="w-10 overflow-hidden rounded-lg">
          <div className="relative h-2 w-full">
            <div className="absolute left-0 right-0 top-0 h-2 min-w-0.5 rounded-full bg-[#3f3f46]" />
            <div
              className="absolute left-0 top-0 flex h-2 min-w-0.5 items-center justify-center"
              style={{ right: fillRight }}
            >
              <div className="size-full -rotate-180 -scale-x-100">
                <div className="size-full rounded-full bg-[#f97316]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WeightChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const bars = values.slice(0, 6);
  while (bars.length < 6) bars.push(bars[bars.length - 1] ?? 50);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between">
      {bars.map((value, i) => (
        <div key={i} className="flex min-w-[22px] flex-col items-center gap-1">
          <WeightBar fillPercent={(value / max) * 100} />
          <p className="text-center text-[9px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8] whitespace-nowrap">
            {MATCH_MINUTES[i]}
          </p>
        </div>
      ))}
    </div>
  );
}

function BloodPressureChart({ values }: { values: number[] }) {
  const bars = values.slice(0, 6);
  while (bars.length < 6) bars.push(bars[bars.length - 1] ?? 50);

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between">
      {bars.map((value, i) => {
        const topHeight = Math.max(8, Math.round((value / 100) * 24));
        const bottomHeight = Math.max(8, 24 - topHeight);
        const purpleTop = i % 2 === 0;
        return (
          <div key={i} className="flex min-w-[22px] flex-col items-center gap-1">
            <div className="flex h-10 w-full flex-col items-center gap-0.5">
              <div
                className="w-1 shrink-0 rounded-lg"
                style={{
                  height: topHeight,
                  backgroundColor: purpleTop ? "#6b21a8" : "#a855f7",
                }}
              />
              <div
                className="w-1 rounded-lg flex-1"
                style={{
                  minHeight: bottomHeight,
                  backgroundColor: purpleTop ? "#a855f7" : "#6b21a8",
                }}
              />
            </div>
            <p className="text-center text-[9px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8] whitespace-nowrap">
              {MATCH_MINUTES[i]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function HeartRateChart() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <div className="relative h-10 w-full">
        <div className="absolute inset-[4.89%_0_0_0] flex items-center justify-center">
          <div className="-rotate-180 -scale-x-100 size-full">
            <div className="relative size-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt=""
                src={figmaAsset("1309e7eea426642d0a0eb3e5ff7ae62981794a12")}
                className="absolute inset-0 block size-full max-w-none"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-[4.89%_0_0_0] flex items-center justify-center">
          <div className="-rotate-180 -scale-x-100 size-full">
            <div className="relative size-full">
              <div className="absolute inset-[-2.63%_-0.67%_-4.43%_-0.67%]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt=""
                  src={figmaAsset("d5aade20d37610e5dee830143dbf485db9d802e3")}
                  className="block size-full max-w-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex w-full items-start justify-between text-center text-[9px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8]">
        {MATCH_MINUTES.map((minute) => (
          <span key={minute} className="min-w-[22px] whitespace-nowrap">
            {minute}
          </span>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full rounded-[24px] border border-[#3f3f46] bg-[#18181b] px-[18px] py-4">
      {children}
    </div>
  );
}

type FitnessMetricsProps = {
  dimensions: AnalysisDimensions;
  goalProbabilities: AnalysisGoalProbabilities;
  momentum: number[];
  roi: number;
  pick: AnalysisPick;
};

export function FitnessMetrics({
  dimensions,
  goalProbabilities,
  momentum,
  roi,
  pick,
}: FitnessMetricsProps) {
  const xg = (
    (goalProbabilities.over2 / 100) * 2.8 +
    (goalProbabilities.exactly2 / 100) * 2
  ).toFixed(1);
  const shots = Math.max(6, Math.round(dimensions.attack / 5));

  return (
    <section className="flex w-full flex-col items-center gap-3">
      <SectionHeader />

      <div className="flex w-full flex-col gap-2">
        <MetricCard>
          <div className="flex flex-col gap-6">
            <CardHeader
              iconSrc="3828572d53de36e9a9f754969a933d536579e779"
              iconInset="inset-[9.33%_6.16%_9.71%_6.15%]"
              title="控球率"
            />
            <div className="flex w-full items-center gap-3">
              <ValueBlock
                value={String(dimensions.possession)}
                unit="%"
                subtitle="主隊優勢"
              />
              <WeightChart values={momentum} />
            </div>
          </div>
        </MetricCard>

        <MetricCard>
          <div className="flex flex-col gap-6">
            <CardHeader
              iconSrc="7852f61e478f16e05a54fc12a8e9a1648b49cfdb"
              iconInset="inset-[9.93%_12.96%_8.94%_12.96%]"
              title="預期進球 (xG)"
            />
            <div className="flex w-full items-center gap-3">
              <ValueBlock
                value={xg}
                unit=""
                subtitle={`ROI ${roi > 0 ? "+" : ""}${roi.toFixed(1)}%`}
              />
              <BloodPressureChart
                values={[
                  goalProbabilities.under2,
                  goalProbabilities.exactly2,
                  goalProbabilities.over2,
                  goalProbabilities.over2,
                  goalProbabilities.exactly2,
                  goalProbabilities.under2,
                ]}
              />
            </div>
          </div>
        </MetricCard>

        <MetricCard>
          <div className="flex flex-col gap-6">
            <CardHeader
              iconSrc="d875ca6469c77364cca0fb8f503099d9d04a3005"
              iconInset="inset-[13.09%_4.47%_9.1%_4.48%]"
              title="射門次數"
            />
            <div className="flex w-full items-center gap-3">
              <ValueBlock
                value={String(shots)}
                unit="次"
                subtitle={`${pick.market} · ${pick.selection}`}
              />
              <HeartRateChart />
            </div>
          </div>
        </MetricCard>
      </div>
    </section>
  );
}
