export interface SubmitVoteDto {
  pollId: string;
  optionId: string;
  studentName: string;
  studentSessionId: string;
}

export interface Vote {
  _id: string;
  pollId: string;
  optionId: string;
  studentName: string;
  studentSessionId: string;
  submittedAt: string;
}

