export interface IOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
  voteCount: number;
}

export interface Poll {
  _id: string;
  question: string;
  options: IOption[];
  duration: number;
  status: 'draft' | 'active' | 'ended';
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  totalVotes: number;
}

export interface CreatePollDto {
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  duration: number;
  sessionId?: string;
  createdBy?: string;
}

export interface PollResults {
  pollId: string;
  question: string;
  options: Array<{
    id: string;
    text: string;
    voteCount: number;
    percentage: number;
  }>;
  totalVotes: number;
}

export interface PollHistory {
  pollId: string;
  question: string;
  options: Array<{
    text: string;
    voteCount: number;
    percentage: number;
  }>;
  totalVotes: number;
  endedAt: string;
  createdAt: string;
}

