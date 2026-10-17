export type UserRole = "member" | "admin";

export type RecordType = "text" | "photo" | "video";

export type UserRecord = {
  id: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  vipExpiresAt: string | null;
  createdAt: string;
};

export type RecordItem = {
  id: string;
  authorId: string;
  authorName: string;
  type: RecordType;
  title: string;
  titleEn: string | null;
  content: string | null;
  contentEn: string | null;
  mediaUrl: string | null;
  displayDate: string | null;
  starRating: number | null;
  createdAt: string;
};

export type JwtPayload = {
  sub: string;
  username: string;
  role: UserRole;
};
