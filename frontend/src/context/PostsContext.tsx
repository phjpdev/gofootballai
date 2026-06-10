"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "@/context/AuthContext";
import {
  createRecord,
  deleteRecord,
  fetchPublicRecords,
  fetchRecords,
  updateRecord,
} from "@/lib/records-api";
import type { Post, PostType } from "@/types";

type PostsContextValue = {
  posts: Post[];
  isLoading: boolean;
  refreshPosts: () => Promise<void>;
  addPost: (input: {
    type: PostType;
    title: string;
    content?: string;
    file?: File;
  }) => Promise<void>;
  editPost: (
    id: string,
    input: {
      type: PostType;
      title: string;
      content?: string;
      file?: File;
    },
  ) => Promise<void>;
  removePost: (id: string) => Promise<void>;
};

const PostsContext = createContext<PostsContextValue | null>(null);

export function PostsProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated, isMember, isAdmin } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isAuthenticated && (isMember || isAdmin) && token) {
        const records = await fetchRecords(token);
        setPosts(records);
      } else {
        const records = await fetchPublicRecords();
        setPosts(records);
      }
    } catch {
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, isMember, isAdmin, token]);

  useEffect(() => {
    void refreshPosts();
  }, [refreshPosts]);

  const addPost = useCallback(
    async (input: {
      type: PostType;
      title: string;
      content?: string;
      file?: File;
    }) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      const record = await createRecord(token, input);
      setPosts((prev) => [record, ...prev]);
    },
    [token],
  );

  const editPost = useCallback(
    async (
      id: string,
      input: {
        type: PostType;
        title: string;
        content?: string;
        file?: File;
      },
    ) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      const record = await updateRecord(token, id, input);
      setPosts((prev) =>
        prev.map((post) => (post.id === id ? record : post)),
      );
    },
    [token],
  );

  const removePost = useCallback(
    async (id: string) => {
      if (!token) {
        throw new Error("Not authenticated");
      }
      await deleteRecord(token, id);
      setPosts((prev) => prev.filter((post) => post.id !== id));
    },
    [token],
  );

  return (
    <PostsContext.Provider
      value={{ posts, isLoading, refreshPosts, addPost, editPost, removePost }}
    >
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
