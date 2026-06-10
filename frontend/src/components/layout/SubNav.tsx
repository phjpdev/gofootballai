import Link from "next/link";

type SubNavProps = {
  title: string;
  count?: number;
  seeAllHref?: string;
};

export function SubNav({ title, count, seeAllHref = "#" }: SubNavProps) {
  return (
    <div className="flex w-full items-center justify-between">
      <p className="text-base font-bold tracking-[-0.048px] text-white">
        {title}{" "}
        {count !== undefined && (
          <span className="text-gray-40">({count})</span>
        )}
      </p>
      <Link
        href={seeAllHref}
        className="text-sm font-medium tracking-[-0.028px] text-orange-50"
      >
        查看全部
      </Link>
    </div>
  );
}
