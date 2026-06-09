import { TopNav } from "@/components/layout/TopNav";
import { SystemIntro } from "@/components/home/SystemIntro";
import { PostFeed } from "@/components/home/PostFeed";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Home" />

      <SystemIntro />

      <PostFeed />

      <section className="relative h-[200px] w-full overflow-hidden rounded-[24px]">
        <Image
          src="/images/featured-home-hero.png"
          alt="Soccer match action"
          fill
          className="object-cover"
          sizes="(max-width: 375px) 100vw, 343px"
          priority
        />
      </section>
    </div>
  );
}
