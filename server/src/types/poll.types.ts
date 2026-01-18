import { Document } from 'mongoose';

export interface IOption {
  _id?: string;
  text: string;
  isCorrect: boolean;
  voteCount: number;
}

export interface IPoll extends Document {
  question: string;
  options: IOption[];
  duration: number;
  status: 'draft' | 'active' | 'ended';
  startTime?: Date;
  endTime?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  totalVotes: number;
}

export interface CreatePollDto {
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  duration: number;
  createdBy: string;
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
  endedAt: Date;
  createdAt: Date;
}

