// This file was auto-generated by prisma-generator-typescript-interfaces

export type Role = "USER" | "ADMIN";

export type Frequency = "DAILY" | "WEEKDAYS" | "ALTERNATING" | "WEEKLY" | "CUSTOM";

export interface User {
  id: number;
  email: string;
  role: Role;
  createdAt: Date;
  password: string | null;
  updatetAt: Date;
  clerkId: string | null;
  lastLogin: Date | null;
  challenges?: Challenge[];
  checkIns?: CheckIn[];
  comments?: Comment[];
  threads?: Thread[];
  likes?: Like[];
  memberChallenges?: MemberChallenge[];
  Note?: Note[];
  posts?: Post[];
  profile?: Profile | null;
}

export interface Profile {
  id: number;
  userId: number;
  firstName: string | null;
  lastName: string | null;
  profileImage: string | null;
  user?: User;
}

export interface Note {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishAt: Date;
  body: string | null;
  published: boolean;
  userId: number;
  replyToId: number | null;
  challengeId: number | null;
  commentId: number | null;
  image: string | null;
  isShare: boolean;
  video: string | null;
  postId: number | null;
  likeCount: number;
  replyCount: number;
  isThread: boolean;
  imageMeta: JsonValue | null;
  videoMeta: JsonValue | null;
  likes?: Like[];
  challenge?: Challenge | null;
  comment?: Comment | null;
  post?: Post | null;
  replyTo?: Note | null;
  replies?: Note[];
  user?: User;
}

export interface Thread {
  id: number;
  title: string;
  body: string | null;
  userId: number;
  challengeId: number | null;
  challenge?: Challenge | null;
  user?: User;
  image: string | null;
  imageMeta: JsonValue | null;
  videoMeta: JsonValue | null;
  video: string | null;
  likeCount: number;
  likes?: Like[];
  commentCount: number;
  comments?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  published: boolean;
  body: string | null;
  publishAt: Date | null;
  userId: number;
  challengeId: number | null;
  embed: string | null;
  image: string | null;
  video: string | null;
  public: boolean;
  commentCount: number;
  likeCount: number;
  notifyMembers: boolean | null;
  notificationSentOn: Date | null;
  imageMeta: JsonValue | null;
  videoMeta: JsonValue | null;
  comments?: Comment[];
  likes?: Like[];
  notes?: Note[];
  challenge?: Challenge | null;
  user?: User;
  categories?: Category[];
}

export interface Challenge {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishAt: Date;
  name: string;
  published: boolean;
  userId: number;
  color: string | null;
  description: string | null;
  endAt: Date | null;
  icon: string | null;
  reminders: boolean;
  startAt: Date;
  syncCalendar: boolean;
  frequency: Frequency;
  mission: string | null;
  public: boolean;
  video: string | null;
  commentCount: number;
  likeCount: number;
  coverPhotoMeta: JsonValue | null;
  videoMeta: JsonValue | null;
  user?: User;
  checkIns?: CheckIn[];
  comments?: Comment[];
  likes?: Like[];
  members?: MemberChallenge[];
  notes?: Note[];
  posts?: Post[];
  threads?: Thread[];
}

export interface MemberChallenge {
  userId: number;
  challengeId: number;
  createdAt: Date;
  nextCheckIn: Date | null;
  lastCheckIn: Date | null;
  id: number;
  checkIns?: CheckIn[];
  challenge?: Challenge;
  user?: User;
}

export interface CheckIn {
  id: number;
  data: JsonValue | null;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  challengeId: number;
  memberChallengeId: number;
  challenge?: Challenge;
  memberChallenge?: MemberChallenge;
  user?: User;
  likes?: Like[];
  likeCount: number;
}

export interface Comment {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  body: string;
  imageMeta: JsonValue | null;
  videoMeta: JsonValue | null;
  userId: number;
  postId: number | null;
  challengeId: number | null;
  threadId: number | null;
  replyToId: number | null;
  threadDepth: number;
  likeCount: number;
  replyCount: number;
  challenge?: Challenge | null;
  thread?: Thread | null;
  post?: Post | null;
  replyTo?: Comment | null;
  replies?: Comment[];
  user?: User;
  likes?: Like[];
  notes?: Note[];
}

export interface Like {
  id: number;
  createdAt: Date;
  userId: number;
  postId: number | null;
  threadId: number | null;
  challengeId: number | null;
  commentId: number | null;
  noteId: number | null;
  checkinId: number | null;
  challenge?: Challenge | null;
  comment?: Comment | null;
  thread?: Thread | null;
  note?: Note | null;
  post?: Post | null;
  checkin?: CheckIn | null;
  user?: User;
}

export interface Category {
  id: number;
  name: string;
  posts?: Post[];
}

type JsonValue = string | number | boolean | { [key in string]?: JsonValue } | Array<JsonValue> | null;
