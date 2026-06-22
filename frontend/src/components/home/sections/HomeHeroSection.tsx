import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeAsset } from "@/lib/home-assets";

type HomeHeroSectionProps = {
  onGetStarted?: () => void;
};

export function HomeHeroSection({ onGetStarted }: HomeHeroSectionProps) {
  return (
    <section className="relative h-full w-full overflow-hidden bg-black lg:h-auto lg:min-h-[min(900px,92vh)] lg:rounded-t-[24px]">
      <div className="relative h-full w-full lg:h-auto lg:min-h-[min(900px,92vh)]">
        <Image
          src={homeAsset("hero-soccer-bg.png")}
          alt=""
          priority
          fill
          className="object-cover object-center lg:object-[center_20%]"
          sizes="100vw"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black lg:from-black/30 lg:via-black/50 lg:to-black" />
        <div
          className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(ellipse_60%_50%_at_70%_40%,rgba(249,115,22,0.15),transparent)] lg:block"
          aria-hidden
        />

        <div className="absolute inset-x-0 bottom-0 flex w-full flex-col gap-12 px-8 py-6 lg:inset-0 lg:justify-center lg:px-16 lg:py-20 xl:px-24">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 lg:gap-10">
            <div className="flex flex-col gap-4 text-center lg:max-w-2xl lg:text-left">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-50 lg:text-base">
                GO Football AI
              </p>
              <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white lg:text-5xl lg:leading-[1.15] xl:text-6xl">
                歡迎使用GO AI足球分析APP
              </h1>
              <p className="text-base leading-[1.6] text-[#d4d4d8] lg:max-w-xl lg:text-lg lg:leading-relaxed">
                由AI驅動的專業足球分析平台，專為追求理性投注與穩定回報的你而設計
              </p>
            </div>

            <div className="flex flex-col gap-6 lg:max-w-md lg:items-start">
              {onGetStarted ? (
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-50 px-5 py-3 text-base font-semibold leading-[22px] tracking-[-0.112px] text-white transition-opacity hover:opacity-90 lg:w-auto lg:px-8"
                >
                  立即開始
                  <ArrowRight className="size-5" strokeWidth={2} />
                </button>
              ) : (
                <Link
                  href="/analysis"
                  className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-50 px-5 py-3 text-base font-semibold leading-[22px] tracking-[-0.112px] text-white transition-opacity hover:opacity-90 lg:w-auto lg:px-8"
                >
                  開始分析
                  <ArrowRight className="size-5" strokeWidth={2} />
                </Link>
              )}
              <p className="text-center text-sm font-medium leading-5 tracking-[-0.084px] text-white lg:text-left">
                已有帳戶？{" "}
                <Link
                  href="/member"
                  className="font-bold text-orange-50 underline decoration-solid underline-offset-2"
                >
                  登入
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
