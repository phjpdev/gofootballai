import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export function HomeScoreSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="AI 量化評分系統"
        description="根據球隊戰術、球員狀態及歷史數據，為每場賽事提供專屬 AI 評分。"
      />

      <div className="relative h-[340px] w-full max-w-[343px] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[528.871px] w-[260px] -translate-x-1/2 drop-shadow-[0px_9.637px_10.708px_rgba(31,41,55,0.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={homeAsset("ad62acaddaae4aa94abd98c8ba22a349c6fd31c6.svg")}
            className="absolute inset-0 size-full max-w-none"
          />
          <div className="absolute inset-[2.08%_4.98%_2.12%_5.15%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={homeAsset("c6ca37311faef48e727646646a3107d89a6d7d11.svg")}
              className="absolute inset-0 size-full max-w-none"
            />
          </div>
          <div className="absolute inset-[3.33%_35.52%_92.59%_35.8%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={homeAsset("eca77cd840294b0bae4b78548a7f9c8ae05c6219.svg")}
              className="absolute inset-0 size-full max-w-none"
            />
          </div>
        </div>

        <div className="absolute left-1/2 top-1/2 w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-[24px] border border-[#3f3f46] bg-[#18181b] p-4 shadow-[0px_4px_8px_rgba(15,23,42,0.03),0px_8px_16px_rgba(15,23,42,0.02)]">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-4">
                <div className="flex flex-1 items-center gap-2">
                  <div className="relative size-6 shrink-0">
                    <div className="absolute inset-[1.97%_6.74%_7.5%_7.5%]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        src={homeAsset("64419fed0ab7211bb6db52fefa6ee9beaefa57d0.svg")}
                        className="absolute inset-0 size-full max-w-none"
                      />
                    </div>
                  </div>
                  <p className="text-2xl font-bold leading-8 tracking-[-0.288px] text-white">
                    82.5
                  </p>
                </div>
                <button
                  type="button"
                  className="flex shrink-0 items-center justify-center gap-1 rounded-[10px] border border-[#3f3f46] px-2.5 py-1"
                >
                  <div className="relative size-3.5">
                    <div className="absolute inset-[12.5%_9.35%]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        src={homeAsset("110408d7e87edb36f992b4949d650a327a95bf15.svg")}
                        className="absolute inset-0 size-full max-w-none"
                      />
                    </div>
                  </div>
                  <span className="text-xs font-semibold leading-4 tracking-[-0.06px] text-[#d4d4d8]">
                    本週
                  </span>
                  <div className="relative size-4">
                    <div className="absolute inset-[31.69%_12.84%_28.43%_12.83%]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        alt=""
                        src={homeAsset("c1c899b371f4fef3c526d33512c039ee587836ad.svg")}
                        className="absolute inset-0 size-full max-w-none"
                      />
                    </div>
                  </div>
                </button>
              </div>
              <p className="text-sm font-medium leading-5 tracking-[-0.084px] text-[#d4d4d8]">
                AI 綜合評分
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="relative h-[98px] w-full border-b border-[#3f3f46]">
                <div className="absolute inset-[12.42%_0_0_0]">
                  <div className="absolute inset-[-1.17%_-0.35%_0_-0.35%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={homeAsset("2a6658a42a22d311c2d175d39eb10038858d222b.svg")}
                      className="block size-full max-w-none"
                    />
                  </div>
                </div>
                <div className="absolute inset-[-1.02%_-0.35%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={homeAsset("746a5f70f1a50ae0dcecba6f1df56524a5c3a88d.svg")}
                    className="block size-full max-w-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between text-center text-[10px] font-normal leading-[14px] tracking-[-0.04px] text-[#d4d4d8]">
                {WEEKDAYS.map((day) => (
                  <span key={day} className="flex-1">
                    {day}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="relative size-4">
                  <div className="absolute inset-[26.22%_4.38%_21.04%_9.55%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={homeAsset("ddf6e1b8566540385e9c9df9645859a3a276fd4a.svg")}
                      className="absolute inset-0 size-full max-w-none"
                    />
                  </div>
                </div>
                <p className="whitespace-nowrap text-xs leading-4 tracking-[-0.06px]">
                  <span className="font-bold text-[#f43f5e]">-12%</span>{" "}
                  <span className="text-[#d4d4d8]">較上週</span>
                </p>
              </div>
              <div className="size-1.5 rounded-full bg-[#3f3f46]" />
              <div className="flex items-center gap-1">
                <div className="relative size-4">
                  <div className="absolute inset-[0_4.17%_4.17%_4.17%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={homeAsset("f29c93640930037f97a8a617bb9c286ea49af95b.svg")}
                      className="absolute inset-0 size-full max-w-none"
                    />
                  </div>
                </div>
                <p className="whitespace-nowrap text-xs leading-4 tracking-[-0.06px] text-[#d4d4d8]">
                  8 項建議
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
