import Image from "next/image";
import Link from "next/link";
import { Clock, FileText } from "lucide-react";

type MatchCardProps = {
  title: string;
  tag: string;
  progress: number;
  movements: number;
  completion: number;
  imageSrc?: string;
  href?: string;
};

export function MatchCard({
  title,
  tag,
  progress,
  movements,
  completion,
  imageSrc = "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=200&h=200&fit=crop",
  href,
}: MatchCardProps) {
  const content = (
    <div className="w-full rounded-[32px] bg-gray-90 p-3 transition-colors hover:bg-gray-80">
      <div className="flex items-center gap-3">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-[21px] bg-white">
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover object-center"
            sizes="80px"
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-lg font-bold tracking-[-0.072px] text-white">
              {title}
            </h3>
            <span className="flex h-6 shrink-0 items-center justify-center rounded-lg bg-gray-80 px-2 py-1 text-xs font-semibold tracking-[-0.018px] text-white">
              {tag}
            </span>
          </div>
          <div className="relative h-2 w-full">
            <div className="absolute inset-0 rounded-[3px] bg-gray-80" />
            <div
              className="absolute inset-y-0 left-0 rounded-[3px] bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <FileText className="size-4 text-gray-40" strokeWidth={2} />
              <span className="text-sm font-medium tracking-[-0.028px] text-white">
                事件 {movements}
              </span>
            </div>
            <span className="size-1 rounded-full bg-gray-70" />
            <div className="flex items-center gap-1">
              <Clock className="size-4 text-gray-40" strokeWidth={2} />
              <span className="text-sm font-medium tracking-[-0.028px] text-white">
                {completion}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
