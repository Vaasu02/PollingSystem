import { Document } from 'mongoose';

export interface IVote extends Document {
  pollId: string;
  optionId: string;
  studentName: string;
  studentSessionId: string;
  submittedAt: Date;
  pollQuestion: string;
  selectedOption: string;
}

export interface SubmitVoteDto {
  pollId: string;
  optionId: string;
  studentName: string;
  studentSessionId: string;
}

export interface VoteCounts {
  [optionId: string]: {
    voteCount: number;
    percentage: number;
  };
}

