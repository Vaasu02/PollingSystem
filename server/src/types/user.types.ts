import { Document } from 'mongoose';

export type UserType = 'teacher' | 'student';

export interface ISession extends Document {
  sessionId: string;
  userType: UserType;
  userName: string;
  currentPollId?: string;
  joinedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
  socketId?: string;
}

export interface CreateSessionDto {
  userType: UserType;
  userName: string;
}

export interface SessionState {
  session: ISession;
  activePoll: any | null;
  remainingTime: number | null;
  hasVoted: boolean;
  selectedOption: string | null;
  pollResults: any | null;
}

