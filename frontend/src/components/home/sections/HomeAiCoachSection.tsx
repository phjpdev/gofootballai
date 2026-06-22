import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { homeAsset } from "@/lib/home-assets";

function CheckIcon() {
  return (
    <div className="relative size-4 shrink-0">
      <div className="absolute inset-[22.23%_1.06%_31.13%_0.83%]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt=""
          src={homeAsset("44bc8e26fb0f62b1c12f2e3c00d8e8bfa36bb9d8.svg")}
          className="absolute inset-0 size-full max-w-none"
        />
      </div>
    </div>
  );
}

export function HomeAiCoachSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="會員營利紀錄"
        description="實會員投注紀錄與盈利統計透明呈現，見證穩定回報，讓你更有信心跟隨專業分析前進。"
      />

      <div className="flex h-[340px] w-full max-w-[320px] items-center">
        <div className="flex w-full flex-col gap-4">
          <div className="flex items-start justify-end gap-2">
            <div className="flex max-w-[calc(100%-48px)] flex-1 flex-col gap-1 rounded-2xl bg-orange-50 p-3">
              <p className="text-sm leading-[1.6] text-white">
                教練，今日有什麼值得關注的賽事？
              </p>
              <div className="flex items-center gap-1 self-end">
                <span className="text-xs leading-4 tracking-[-0.06px] text-[#fed7aa]">
                  11:25
                </span>
                <CheckIcon />
              </div>
            </div>
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={homeAsset("avatar-1.png")}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#431407]">
              <div className="relative size-6">
                <div className="absolute inset-[16.67%_8.33%_12.5%_8.33%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={homeAsset("684ef93f00afc11cb1ef001f98bfb0a27202d0bf.svg")}
                    className="absolute inset-0 size-full max-w-none"
                  />
                </div>
              </div>
            </div>
            <div className="flex max-w-[calc(100%-48px)] flex-1 flex-col gap-1 rounded-2xl border border-[#3f3f46] bg-[#09090b] p-3">
              <p className="text-sm leading-[1.6] text-white">
                根據最新數據，建議關注{" "}
                <span className="font-bold underline">巴西 vs 阿根廷</span>
                {" "}的 AI 深度分析。⚽
              </p>
              <div className="flex items-center gap-1 self-end">
                <span className="text-xs leading-4 tracking-[-0.06px] text-[#d4d4d8]">
                  11:25
                </span>
                <div className="relative size-4">
                  <div className="absolute inset-[22.23%_1.06%_31.13%_0.83%]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt=""
                      src={homeAsset("0804b9bc6a37b6c486600c8890094cd3b00bad95.svg")}
                      className="absolute inset-0 size-full max-w-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-end gap-2">
            <div className="flex items-center gap-2.5 rounded-2xl bg-orange-50 p-3">
              <p className="whitespace-nowrap text-sm leading-[1.6] text-white">
                太好了！馬上查看 🔥
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs leading-4 tracking-[-0.06px] text-[#fed7aa]">
                  11:25
                </span>
                <CheckIcon />
              </div>
            </div>
            <div className="relative size-10 shrink-0 overflow-hidden rounded-full">
              <Image
                src={homeAsset("avatar-1.png")}
                alt=""
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
