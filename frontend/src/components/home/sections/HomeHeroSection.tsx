import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { homeAsset } from "@/lib/home-assets";

export function HomeHeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-black lg:rounded-t-[24px]">
      <div className="relative w-full">
        <Image
          src={homeAsset("hero-bg.png")}
          alt=""
          width={375}
          height={812}
          priority
          className="h-auto w-full"
          sizes="100vw"
        />

        <div className="absolute inset-x-0 bottom-0 h-[65%] bg-gradient-to-b from-transparent to-black" />

        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-12 px-4 py-6 pb-8">
          <div className="flex flex-col gap-4 text-center">
            <h1 className="text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white">
              歡迎使用GO AI足球分析APP
            </h1>
            <p className="text-base leading-[1.6] text-[#d4d4d8]">
              由AI驅動的專業足球分析平台，專為追求理性投注與穩定回報的你而設計
            </p>
          </div>

          <div className="flex flex-col gap-6">
            <Link
              href="/analysis"
              className="flex min-h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-orange-50 px-5 py-3 text-base font-semibold leading-[22px] tracking-[-0.112px] text-white"
            >
              開始分析
              <ArrowRight className="size-5" strokeWidth={2} />
            </Link>
            <p className="text-center text-sm font-medium leading-5 tracking-[-0.084px] text-white">
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
    </section>
  );
}
