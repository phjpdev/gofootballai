import Image from "next/image";
import { ArrowRight, Clock, Flame } from "lucide-react";

type FeaturedMatchCardProps = {
  title: string;
  tag: string;
  duration: string;
  stat: string;
  imageSrc: string;
  href?: string;
};

export function FeaturedMatchCard({
  title,
  tag,
  duration,
  stat,
  imageSrc,
  href = "#",
}: FeaturedMatchCardProps) {
  return (
    <div className="relative h-[225px] w-[261px] shrink-0 overflow-hidden rounded-[24px] bg-gray-90 p-4">
      <div className="pointer-events-none absolute left-[calc(50%+62.5px)] top-[calc(50%+18.5px)] size-[334px] -translate-x-1/2 -translate-y-1/2 mix-blend-lighten">
        <Image
          src={imageSrc}
          alt=""
          fill
          className="object-cover"
          sizes="334px"
        />
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 h-[144px] w-full bg-gradient-to-b from-transparent to-gray-90" />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <span className="inline-flex h-6 w-fit items-center justify-center rounded-lg bg-white/30 px-2 py-1 text-xs font-semibold tracking-[-0.018px] text-white">
          {tag}
        </span>

        <div className="flex w-[229px] items-center justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold tracking-[-0.072px] text-white whitespace-nowrap">
              {title}
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Clock className="size-4 text-white" strokeWidth={2} />
                <span className="text-xs font-medium tracking-[-0.018px] text-white">
                  {duration}
                </span>
              </div>
              <span className="size-1 rounded-full bg-gray-70" />
              <div className="flex items-center gap-1">
                <Flame className="size-4 text-white" strokeWidth={2} />
                <span className="text-xs font-medium tracking-[-0.018px] text-white">
                  {stat}
                </span>
              </div>
            </div>
          </div>
          <a
            href={href}
            aria-label={`View ${title}`}
            className="flex size-10 shrink-0 items-center justify-center rounded-[13px] bg-orange-50 shadow-[0_0_0_4px_rgba(249,115,22,0.25)]"
          >
            <ArrowRight className="size-6 text-white" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </div>
  );
}
