import Link from "next/link";

type SubNavProps = {
  title: string;
  count?: number;
  seeAllHref?: string;
  titleAction?: React.ReactNode;
};

export function SubNav({
  title,
  count,
  seeAllHref = "#",
  titleAction,
}: SubNavProps) {
  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        <p className="text-base font-bold tracking-[-0.048px] text-white">
          {title}{" "}
          {count !== undefined && (
            <span className="text-gray-40">({count})</span>
          )}
        </p>
        {titleAction}
      </div>
      <Link
        href={seeAllHref}
        className="shrink-0 text-sm font-medium tracking-[-0.028px] text-orange-50"
      >
        查看全部
      </Link>
    </div>
  );
}
