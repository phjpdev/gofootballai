import { ChevronRight, Droplets, Heart, Scale } from "lucide-react";
import { SubNav } from "@/components/layout/SubNav";

type MetricCardProps = {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  value: string;
  subtitle: string;
  chartColor: string;
  chartType: "bar" | "line";
  data: number[];
};

function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex h-12 items-end justify-between gap-1">
      {data.map((v, i) => (
        <div
          key={i}
          className="w-full rounded-sm"
          style={{
            height: `${(v / max) * 100}%`,
            backgroundColor: color,
            minHeight: 4,
          }}
        />
      ))}
    </div>
  );
}

function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const w = 100;
  const h = 40;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-10 w-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({
  icon,
  iconBg,
  title,
  value,
  subtitle,
  chartColor,
  chartType,
  data,
}: MetricCardProps) {
  return (
    <div className="rounded-[24px] bg-gray-90 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex size-10 items-center justify-center rounded-[14px]"
            style={{ backgroundColor: iconBg }}
          >
            {icon}
          </div>
          <div>
            <p className="text-sm font-bold text-white">{title}</p>
            <p className="text-xs text-gray-40">Today</p>
          </div>
        </div>
        <ChevronRight className="size-5 text-gray-40" />
      </div>
      <p className="mt-3 text-2xl font-bold tracking-[-0.1px] text-white">{value}</p>
      <p className="text-xs font-medium text-gray-40">{subtitle}</p>
      <div className="mt-3">
        {chartType === "bar" ? (
          <MiniBarChart data={data} color={chartColor} />
        ) : (
          <MiniLineChart data={data} color={chartColor} />
        )}
      </div>
      <div className="mt-2 flex justify-between text-[10px] font-medium text-gray-60">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={`${d}-${i}`}>{d}</span>
        ))}
      </div>
    </div>
  );
}

export function FitnessMetrics() {
  return (
    <section className="flex flex-col gap-3">
      <SubNav title="Fitness Metrics" />
      <MetricCard
        icon={<Scale className="size-5 text-white" strokeWidth={2} />}
        iconBg="#F97316"
        title="Weight"
        value="70.00 kg"
        subtitle="Stable weight"
        chartColor="#F97316"
        chartType="bar"
        data={[60, 72, 68, 70, 65, 80, 70]}
      />
      <MetricCard
        icon={<Droplets className="size-5 text-white" strokeWidth={2} />}
        iconBg="#9333EA"
        title="Blood Pressure"
        value="128/80 mmHg"
        subtitle="Stable Range"
        chartColor="#9333EA"
        chartType="bar"
        data={[55, 70, 65, 80, 60, 75, 68]}
      />
      <MetricCard
        icon={<Heart className="size-5 text-white" strokeWidth={2} />}
        iconBg="#EF4444"
        title="Heart Rate"
        value="72 bpm"
        subtitle="Resting Rate"
        chartColor="#EF4444"
        chartType="line"
        data={[68, 72, 70, 75, 71, 69, 72]}
      />
    </section>
  );
}
