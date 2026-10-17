export type PostType = "text" | "photo" | "video";

export type Post = {
  id: string;
  type: PostType;
  title: string;
  /** Optional English override; English readers fall back to `title`. */
  titleEn?: string;
  content?: string;
  contentEn?: string;
  mediaUrl?: string;
  displayDate?: string;
  starRating?: number;
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
  /** English for `venue` (the HKJC tournament name), when known. */
  tournamentNameEn?: string;
  homeScore?: number;
  awayScore?: number;
  homeTeam?: string;
  awayTeam?: string;
  homeTeamEn?: string;
  awayTeamEn?: string;
  homeLogo?: string;
  awayLogo?: string;
  frontEndId?: string;
};

export type QAItem = {
  id: string;
  question: string;
  answer: string;
};
