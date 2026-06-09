"use client";

import { useState } from "react";

type TournamentFlagProps = {
  src: string;
  code: string;
  name: string;
};

export function TournamentFlag({ src, code, name }: TournamentFlagProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="flex size-full items-center justify-center bg-gray-80 text-[8px] font-bold text-white"
        title={name}
      >
        {code}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="size-full object-contain p-0.5"
      onError={() => setFailed(true)}
    />
  );
}
