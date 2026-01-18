import type { Poll, PollResults } from './poll.types';

export type UserType = 'teacher' | 'student';

export interface Session {
  _id: string;
  sessionId: string;
  userType: UserType;
  userName: string;
  currentPollId?: string;
  joinedAt: string;
  lastActiveAt: string;
  isActive: boolean;
  socketId?: string;
}

export interface CreateSessionDto {
  userType: UserType;
  userName: string;
}

export interface SessionState {
  session: Session;
  activePoll: Poll | null;
  remainingTime: number | null;
  hasVoted: boolean;
  selectedOption: string | null;
  pollResults: PollResults | null;
}

