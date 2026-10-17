"use client";

import { Brain, LineChart, Shield } from "lucide-react";
import { useI18n } from "@/lib/i18n/LocaleProvider";

const FEATURES = [
  { key: "analysis", icon: Brain },
  { key: "tracking", icon: LineChart },
  { key: "prediction", icon: Shield },
] as const;

export function SystemIntro() {
  const { t } = useI18n();
  const copy = t.home.systemIntro;

  return (
    <section className="flex flex-col gap-4">
      <div className="rounded-[24px] bg-gray-90 p-4">
        <h2 className="text-xl font-bold tracking-[-0.1px] text-white">
          {copy.title}
        </h2>
        <p className="mt-2 text-sm leading-[1.6] tracking-[-0.028px] text-gray-20">
          {copy.description}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {FEATURES.map(({ key, icon: Icon }) => {
          const { title, description } = copy.features[key];
          return (
            <div
              key={key}
              className="flex gap-3 rounded-[24px] bg-gray-90 p-4"
            >
              <div className="flex size-10 shrink-0 items-center justify-center rounded-[14px] bg-orange-50">
                <Icon className="size-5 text-white" strokeWidth={2} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-[-0.048px] text-white">
                  {title}
                </h3>
                <p className="mt-1 text-sm leading-[1.6] tracking-[-0.028px] text-gray-40">
                  {description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
