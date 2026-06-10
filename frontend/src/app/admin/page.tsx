import { TopNav } from "@/components/layout/TopNav";
import { AuthForm } from "@/components/member/AuthForm";
import Link from "next/link";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Admin" />

      <AuthForm portalRole="admin" termsHref="/member#terms" />

      <section className="rounded-[24px] bg-gray-90 p-4">
        <h2 className="text-sm font-bold text-white">Admin access</h2>
        <p className="mt-2 text-sm leading-[1.6] text-gray-40">
          Sign up here to create an admin account. After logging in, go to{" "}
          <Link href="/records" className="text-orange-50 underline">
            Records
          </Link>{" "}
          to upload photos, videos, and text for members.
        </p>
      </section>
    </div>
  );
}
