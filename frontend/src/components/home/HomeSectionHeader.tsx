type HomeSectionHeaderProps = {
  title: string;
  description: string;
};

export function HomeSectionHeader({
  title,
  description,
}: HomeSectionHeaderProps) {
  return (
    <div className="flex w-full max-w-[343px] flex-col gap-4 text-center">
      <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.39px] text-white">
        {title}
      </h2>
      <p className="text-base leading-[1.6] text-[#d4d4d8]">{description}</p>
    </div>
  );
}
