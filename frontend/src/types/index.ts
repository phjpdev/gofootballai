export type PostType = "text" | "photo" | "video";

export type Post = {
  id: string;
  type: PostType;
  title: string;
  content?: string;
  mediaUrl?: string;
  createdAt: string;
  authorName?: string;
};

export type Match = {
  id: string;
  title: string;
  tag: string;
  progress: number;
  movements: number;
  completion: number;
  imageSrc: string;
  date: string;
  time: string;
  venue: string;
  homeScore?: number;
  awayScore?: number;
};

export type QAItem = {
  id: string;
  question: string;
  answer: string;
};
