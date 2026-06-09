"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { Post, PostType } from "@/types";

type PostsContextValue = {
  posts: Post[];
  addPost: (input: {
    type: PostType;
    title: string;
    content?: string;
    mediaUrl?: string;
  }) => void;
  removePost: (id: string) => void;
};

const PostsContext = createContext<PostsContextValue | null>(null);
const POSTS_KEY = "gofootball-posts";

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(POSTS_KEY);
      if (stored) {
        setPosts(JSON.parse(stored) as Post[]);
      }
    } catch {
      setPosts([]);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
    }
  }, [posts, loaded]);

  const addPost = useCallback(
    (input: {
      type: PostType;
      title: string;
      content?: string;
      mediaUrl?: string;
    }) => {
      const post: Post = {
        id: `post-${Date.now()}`,
        type: input.type,
        title: input.title,
        content: input.content,
        mediaUrl: input.mediaUrl,
        createdAt: new Date().toISOString(),
      };
      setPosts((prev) => [post, ...prev]);
    },
    [],
  );

  const removePost = useCallback((id: string) => {
    setPosts((prev) => prev.filter((post) => post.id !== id));
  }, []);

  return (
    <PostsContext.Provider value={{ posts, addPost, removePost }}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePosts must be used within PostsProvider");
  }
  return context;
}
