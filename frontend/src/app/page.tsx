import { SystemIntro } from "@/components/home/SystemIntro";
import { PostFeed } from "@/components/home/PostFeed";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <SystemIntro />

      <PostFeed />

      <section className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] sm:aspect-[16/9] lg:aspect-[21/9]">
        <Image
          src="/images/featured-home-hero.png"
          alt="Soccer match action"
          fill
          className="object-cover object-center"
          sizes="(max-width: 1024px) 100vw, 1152px"
          priority
        />
      </section>
    </div>
  );
}
