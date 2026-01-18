export interface SocketAuth {
  sessionId: string;
}

export interface JoinSessionPayload {
  sessionId: string;
}

export interface CreatePollPayload {
  question: string;
  options: Array<{ text: string; isCorrect: boolean }>;
  duration: number;
  createdBy: string;
}

export interface StartPollPayload {
  pollId: string;
}

export interface SubmitVotePayload {
  pollId: string;
  optionId: string;
  studentSessionId: string;
}

export interface EndPollPayload {
  pollId: string;
}

export interface RequestStatePayload {
  sessionId: string;
}

export interface ChatMessagePayload {
  message: string;
  senderName: string;
  sessionId: string;
}

