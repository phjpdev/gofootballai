import { figmaAsset } from "@/lib/figma-assets";

const DAYS = ["一", "二", "三", "四", "五", "六", "日"] as const;

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

function WeightBar({ fillRight }: { fillRight: string }) {
  return (
    <div className="flex h-10 w-2 items-center justify-center">
      <div className="-rotate-90 flex-none">
        <div className="w-10 overflow-hidden rounded-lg">
          <div className="relative h-2 w-full">
            <div className="absolute left-0 right-0 top-0 h-2 min-w-0.5 rounded-full bg-[#3f3f46]" />
            <div
              className={`absolute left-0 top-0 flex h-2 min-w-0.5 items-center justify-center ${fillRight}`}
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

const WEIGHT_BARS = [
  "right-1/2",
  "right-[68.13%]",
  "right-[25.31%]",
  "right-[8.13%]",
  "right-[60%]",
  "right-[77.5%]",
  "right-[60%]",
] as const;

function WeightChart() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between">
      {WEIGHT_BARS.map((fillRight, i) => (
        <div key={i} className="flex w-3 flex-col items-center gap-1">
          <WeightBar fillRight={fillRight} />
          <p className="text-center text-[10px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8]">
            {DAYS[i]}
          </p>
        </div>
      ))}
    </div>
  );
}

type BpSegment = {
  topColor: string;
  topClass: string;
  bottomColor: string;
  bottomClass: string;
};

const BP_BARS: BpSegment[] = [
  {
    topColor: "#6b21a8",
    topClass: "flex-1",
    bottomColor: "#a855f7",
    bottomClass: "h-2",
  },
  {
    topColor: "#6b21a8",
    topClass: "h-[17px]",
    bottomColor: "#a855f7",
    bottomClass: "flex-1",
  },
  {
    topColor: "#6b21a8",
    topClass: "h-[22px]",
    bottomColor: "#a855f7",
    bottomClass: "flex-1",
  },
  {
    topColor: "#a855f7",
    topClass: "h-[22px]",
    bottomColor: "#6b21a8",
    bottomClass: "flex-1",
  },
  {
    topColor: "#a855f7",
    topClass: "h-2",
    bottomColor: "#6b21a8",
    bottomClass: "flex-1",
  },
  {
    topColor: "#a855f7",
    topClass: "h-[13px]",
    bottomColor: "#6b21a8",
    bottomClass: "flex-1",
  },
  {
    topColor: "#6b21a8",
    topClass: "h-[24px]",
    bottomColor: "#a855f7",
    bottomClass: "flex-1",
  },
];

function BloodPressureChart() {
  return (
    <div className="flex min-w-0 flex-1 items-center justify-between">
      {BP_BARS.map((bar, i) => (
        <div key={i} className="flex w-3 flex-col items-center gap-1">
          <div className="flex h-10 w-full flex-col items-center gap-0.5">
            <div
              className={`w-1 shrink-0 rounded-lg ${bar.topClass}`}
              style={{ backgroundColor: bar.topColor }}
            />
            <div
              className={`w-1 rounded-lg ${bar.bottomClass}`}
              style={{ backgroundColor: bar.bottomColor }}
            />
          </div>
          <p className="w-full text-center text-[10px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8]">
            {DAYS[i]}
          </p>
        </div>
      ))}
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
      <div className="flex w-full items-start justify-between px-0.5 text-center text-[10px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8]">
        {DAYS.map((day, i) => (
          <span key={i} className="w-[9px]">
            {day}
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

export function FitnessMetrics() {
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
                value="58"
                unit="%"
                subtitle="主隊優勢"
              />
              <WeightChart />
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
                value="1.8"
                unit=""
                subtitle="高於賽事平均"
              />
              <BloodPressureChart />
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
              <ValueBlock value="14" unit="次" subtitle="近 7 場趨勢" />
              <HeartRateChart />
            </div>
          </div>
        </MetricCard>
      </div>
    </section>
  );
}
