"use client";

import { TopNav } from "@/components/layout/TopNav";
import { AdminPostForm } from "@/components/records/AdminPostForm";
import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/context/PostsContext";
import Link from "next/link";
import { Lock } from "lucide-react";

export default function RecordsPage() {
  const { isAdmin } = useAuth();
  const { posts, removePost } = usePosts();

  return (
    <div className="flex flex-col gap-8">
      <TopNav title="Records" />

      {isAdmin ? (
        <>
          <section className="rounded-[24px] bg-gray-90 p-4">
            <h2 className="mb-4 text-base font-bold text-white">
              Create Post
            </h2>
            <p className="mb-4 text-sm leading-[1.6] text-gray-40">
              Publish photos, videos, or text announcements. All posts appear on
              the Home page for all users.
            </p>
            <AdminPostForm />
          </section>

          {posts.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-base font-bold text-white">
                Your Posts ({posts.length})
              </h2>
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between rounded-[24px] bg-gray-90 p-4"
                >
                  <div>
                    <p className="text-sm font-bold text-white">{post.title}</p>
                    <p className="text-xs capitalize text-gray-40">
                      {post.type}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePost(post.id)}
                    className="rounded-[10px] bg-gray-80 px-3 py-1.5 text-xs font-medium text-gray-20"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </section>
          )}
        </>
      ) : (
        <section className="flex flex-col items-center gap-4 rounded-[24px] bg-gray-90 p-8 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-gray-80">
            <Lock className="size-6 text-gray-40" />
          </div>
          <h2 className="text-base font-bold text-white">Admin Only</h2>
          <p className="text-sm leading-[1.6] text-gray-40">
            Log in as admin on the Member page to post photos, videos, and
            announcements.
          </p>
          <Link
            href="/member"
            className="rounded-[19px] bg-orange-50 px-6 py-3 text-sm font-semibold text-white"
          >
            Go to Member
          </Link>
        </section>
      )}
    </div>
  );
}
