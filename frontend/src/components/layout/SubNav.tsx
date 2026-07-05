import Link from "next/link";

type SubNavProps = {
  title: string;
  count?: number;
  seeAllHref?: string;
  titleAction?: React.ReactNode;
  onTitleClick?: () => void;
};

export function SubNav({
  title,
  count,
  seeAllHref = "#",
  titleAction,
  onTitleClick,
}: SubNavProps) {
  const titleContent = (
    <>
      {title}{" "}
      {count !== undefined && (
        <span className="text-gray-40">({count})</span>
      )}
    </>
  );

  return (
    <div className="flex w-full items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {onTitleClick ? (
          <button
            type="button"
            onClick={onTitleClick}
            className="text-left text-base font-bold tracking-[-0.048px] text-white transition-colors hover:text-orange-50"
          >
            {titleContent}
          </button>
        ) : (
          <p className="text-base font-bold tracking-[-0.048px] text-white">
            {titleContent}
          </p>
        )}
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
