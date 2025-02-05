// This file was auto-generated by prisma-generator-typescript-interfaces

export type Role = "USER" | "ADMIN";

export type ChallengeType = "SCHEDULED" | "SELF_LED";

export type ChallengeStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";

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
  passwordResetTokens?: PasswordResetToken[];
}

export interface PasswordResetToken {
  id: number;
  userId: number;
  token: string;
  expiresAt: Date;
  user?: User;
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
  isShare: boolean;
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
  imageMeta: JsonValue | null;
  videoMeta: JsonValue | null;
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
  publishOnDayNumber: number | null;
  userId: number;
  challengeId: number | null;
  embed: string | null;
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
}

export interface Challenge {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  publishAt: Date;
  name: string;
  categories?: CategoriesOnChallenges[];
  status: ChallengeStatus;
  userId: number;
  color: string | null;
  description: string | null;
  startAt: Date | null;
  endAt: Date | null;
  numDays: number | null;
  icon: string | null;
  type: ChallengeType;
  reminders: boolean;
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
  cohorts?: Cohort[];
}

export interface MemberChallenge {
  userId: number;
  challengeId: number;
  createdAt: Date;
  nextCheckIn: Date | null;
  lastCheckIn: Date | null;
  notificationHour: number | null;
  notificationMinute: number | null;
  startAt: Date | null;
  dayNumber: number;
  id: number;
  checkIns?: CheckIn[];
  challenge?: Challenge;
  user?: User;
  cohortId: number | null;
  cohort?: Cohort | null;
}

export interface Cohort {
  id: number;
  challengeId: number;
  challenge?: Challenge;
  members?: MemberChallenge[];
  comments?: Comment[];
  checkIns?: CheckIn[];
  createdAt: Date;
  updatedAt: Date;
  startAt: Date | null;
}

export interface CheckIn {
  id: number;
  data: JsonValue | null;
  body: string | null;
  imageMeta: JsonValue | null;
  videoMeta: JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  userId: number;
  challengeId: number;
  cohortId: number | null;
  cohort?: Cohort | null;
  memberChallengeId: number;
  challenge?: Challenge;
  memberChallenge?: MemberChallenge;
  user?: User;
  likes?: Like[];
  likeCount: number;
  comments?: Comment[];
  commentCount: number;
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
  cohortId: number | null;
  cohort?: Cohort | null;
  threadId: number | null;
  replyToId: number | null;
  checkInId: number | null;
  threadDepth: number;
  likeCount: number;
  replyCount: number;
  challenge?: Challenge | null;
  thread?: Thread | null;
  post?: Post | null;
  replyTo?: Comment | null;
  checkIn?: CheckIn | null;
  replies?: Comment[];
  user?: User;
  likes?: Like[];
  notes?: Note[];
}

export interface Category {
  id: number;
  name: string;
  challenges?: CategoriesOnChallenges[];
}

export interface CategoriesOnChallenges {
  challenge?: Challenge;
  challengeId: number;
  category?: Category;
  categoryId: number;
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
  checkIn?: CheckIn | null;
  user?: User;
}

type JsonValue = string | number | boolean | { [key in string]?: JsonValue } | Array<JsonValue> | null;
