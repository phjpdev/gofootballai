type HomeSectionHeaderProps = {
  title: string;
  description: string;
  align?: "center" | "left";
};

export function HomeSectionHeader({
  title,
  description,
  align = "center",
}: HomeSectionHeaderProps) {
  return (
    <div
      className={
        align === "left"
          ? "flex w-full max-w-xl flex-col gap-4 text-left lg:max-w-lg"
          : "flex w-full max-w-[343px] flex-col gap-4 text-center lg:max-w-xl lg:text-left"
      }
    >
      <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white lg:text-4xl lg:leading-tight xl:text-[42px]">
        {title}
      </h2>
      <p className="text-base leading-[1.6] text-[#d4d4d8] lg:text-lg lg:leading-relaxed">
        {description}
      </p>
    </div>
  );
}
