export interface User {
  id: string;
  name: string;
  email: string;
  isGuest: boolean;
  onboardingComplete: boolean;
  profile?: UserProfile;
}

export interface UserProfile {
  journeyStage: string;
  currentFeelings: string[];
  interests: string[];
  language: string;
  displayName: string;
}

export interface MoodEntry {
  id: string;
  date: string;
  mood: 'happy' | 'down' | 'overwhelmed' | 'numb';
  note?: string;
}

export interface Reflection {
  id: string;
  date: string;
  content: string;
  mood?: string;
}

export interface Secret {
  id: string;
  content: string;
  allowReplies: boolean;
  replies: Reply[];
  timestamp: number;
}

export interface Reply {
  id: string;
  content: string;
  timestamp: number;
}

export interface HeartbeatMoment {
  id: string;
  date: string;
  babyHeartbeat: number[];
  motherHeartbeat: number[];
  title: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  authorType: 'user' | 'psychologist';
  timestamp: number;
  replies: ForumReply[];
  tags: string[];
}

export interface ForumReply {
  id: string;
  content: string;
  author: string;
  authorType: 'user' | 'psychologist';
  timestamp: number;
}