import Image from "next/image";
import { HomeSectionHeader } from "@/components/home/HomeSectionHeader";
import { figmaAsset } from "@/lib/figma-assets";
import { homeAsset } from "@/lib/home-assets";

const AVATARS = [
  { src: "avatar-1.png", active: false },
  { src: "e769c3fc8889b7c8ed5156bb61b5a7d6e8d61ec7.png", active: false },
  { src: "85f6d8be869162e777b12be4b1cae1b610113ef4.png", active: true },
  { src: "d2425d2cc186ffeaa3bce5bbaa44d45c16a852bb.png", active: false },
] as const;

const SCHEDULE = [
  { date: "6/17", status: "可預約", available: true },
  { date: "6/18", status: "已滿", available: false },
  { date: "6/19", status: "可預約", available: true },
  { date: "6/20", status: "可預約", available: true },
] as const;

function StarRating() {
  return (
    <div className="flex items-start gap-0.5">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="relative size-4">
          <div className="absolute inset-[5.25%_3.13%_4.9%_3.13%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt=""
              src={homeAsset("3593043140da7d7f9e3ffc20544b94bf065b9e7a.svg")}
              className="absolute inset-0 size-full max-w-none"
            />
          </div>
        </div>
      ))}
      <div className="relative size-4">
        <div className="absolute inset-[5.25%_3.13%_4.9%_3.13%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            src={homeAsset("e54f4a42239a1f143219e5738008aa8d4c2a45e9.svg")}
            className="absolute inset-0 size-full max-w-none"
          />
        </div>
      </div>
    </div>
  );
}

export function HomeCoachSection() {
  return (
    <section className="flex w-full flex-col items-center gap-12">
      <HomeSectionHeader
        title="簡單易用 · 5星級投注體驗"
        description="簡潔直觀介面、智慧推薦、讓你隨時隨地都能享受專業、高效且愉快的分析體驗。"
      />

      <div className="relative h-[340px] w-full max-w-[343px] overflow-hidden drop-shadow-[0px_4px_4px_rgba(15,23,42,0.03),0px_8px_8px_rgba(15,23,42,0.02)]">
        <div className="absolute left-1/2 top-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center">
          <div className="z-[2] mb-[-6px] flex flex-col items-center">
            <div className="flex items-center gap-[18px]">
              {AVATARS.map(({ src, active }) => (
                <div
                  key={src}
                  className={`relative size-10 overflow-hidden rounded-full ${
                    active
                      ? "border-2 border-orange-50"
                      : "border border-white/30"
                  }`}
                >
                  <Image
                    src={homeAsset(src)}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              ))}
            </div>
            <div className="flex flex-col items-center">
              <div className="h-8 w-0">
                <div className="absolute inset-[0_-1px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={homeAsset("dad025bf4db88e3fc81699e6ff891161f8eba7d8.svg")}
                    className="block size-full max-w-none"
                  />
                </div>
              </div>
              <div className="size-3 rounded-full bg-orange-50" />
            </div>
          </div>

          <div className="z-[1] w-full rounded-[24px] border border-[#3f3f46] bg-[#09090b] p-3">
            <div className="flex items-center gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-black/15">
                  <Image
                    src={homeAsset("85f6d8be869162e777b12be4b1cae1b610113ef4.png")}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="text-base font-semibold leading-[22px] tracking-[-0.112px] text-white">
                    陳志明 分析師
                  </p>
                  <p className="text-base leading-[22px] tracking-[-0.112px] text-[#d4d4d8]">
                    世界盃戰術專家
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className="relative size-5">
                        <div className="absolute inset-[13.09%_4.47%_9.1%_4.48%]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            src={homeAsset("1149bcf589f1166b2969e4fb593760d2128b3a03.svg")}
                            className="absolute inset-0 size-full max-w-none"
                          />
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-5 tracking-[-0.084px] text-white">
                        戰術分析
                      </p>
                    </div>
                    <div className="size-1.5 rounded-full bg-[#3f3f46]" />
                    <div className="flex items-center gap-1">
                      <div className="relative size-5">
                        <div className="absolute inset-[8.94%_12.96%_11.26%_12.96%]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt=""
                            src={homeAsset("fc96464414b40492b4f4e8499256405ced694215.svg")}
                            className="absolute inset-0 size-full max-w-none"
                          />
                        </div>
                      </div>
                      <p className="text-sm font-medium leading-5 tracking-[-0.084px] text-white">
                        香港
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StarRating />
                    <p className="text-sm font-bold leading-5 tracking-[-0.084px] text-white">
                      4.5
                    </p>
                    <p className="text-sm leading-5 tracking-[-0.084px] text-[#a1a1aa]">
                      (500)
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="relative size-5">
                      <div className="absolute inset-[8.33%]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          alt=""
                          src={homeAsset("aaa2b896d9a80d5efb2a30956ca671b6da4d71ee.svg")}
                          className="absolute inset-0 size-full max-w-none"
                        />
                      </div>
                    </div>
                    <p className="text-sm leading-5 tracking-[-0.084px] text-[#65a30d]">
                      支援線上諮詢
                    </p>
                  </div>
                </div>
              </div>
              <div className="relative size-5 shrink-0">
                <div className="absolute inset-[12.84%_28.44%_12.84%_31.69%]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt=""
                    src={figmaAsset("44fa759040c464414aab1abfac01547773dd8246")}
                    className="absolute inset-0 size-full max-w-none"
                  />
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {SCHEDULE.map(({ date, status, available }) => (
                <div
                  key={date}
                  className={`w-[88px] shrink-0 rounded-xl border px-2 py-1.5 ${
                    available
                      ? "border-orange-50 bg-[#431407] text-[#d4d4d8]"
                      : "border-[#3f3f46] bg-[#09090b] text-[#a1a1aa]"
                  }`}
                >
                  <p className="text-xs leading-4">{date}</p>
                  <p
                    className={`text-xs font-semibold leading-4 ${
                      available ? "text-[#ea580c]" : ""
                    }`}
                  >
                    {status}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
