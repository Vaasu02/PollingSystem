import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import type { ApiResponse } from '../types/api.types';
import type { CreateSessionDto, SessionState } from '../types/user.types';
import type { CreatePollDto, Poll, PollResults, PollHistory } from '../types/poll.types';
import type { SubmitVoteDto } from '../types/vote.types';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const api = {
  sessions: {
    create: async (data: CreateSessionDto): Promise<ApiResponse<{ sessionId: string; session: any }>> => {
      const response = await apiClient.post('/sessions', data);
      return response.data;
    },
    
    getState: async (sessionId: string): Promise<ApiResponse<SessionState>> => {
      const response = await apiClient.get(`/sessions/${sessionId}/state`);
      return response.data;
    },
    
    getParticipants: async (sessionId: string): Promise<ApiResponse<{ participants: any[] }>> => {
      const response = await apiClient.get(`/sessions/${sessionId}/participants`);
      return response.data;
    },
    
    kickStudent: async (data: { teacherSessionId: string; targetSessionId: string }): Promise<ApiResponse<any>> => {
      const response = await apiClient.post('/sessions/kick', data);
      return response.data;
    },
  },
  
  polls: {
    create: async (data: CreatePollDto): Promise<ApiResponse<{ poll: Poll }>> => {
      const response = await apiClient.post('/polls', data);
      return response.data;
    },
    
    start: async (pollId: string, sessionId: string): Promise<ApiResponse<{ poll: Poll; startTime: string; duration: number }>> => {
      const response = await apiClient.post(`/polls/${pollId}/start`, { sessionId });
      return response.data;
    },
    
    end: async (pollId: string): Promise<ApiResponse<{ poll: Poll; results: PollResults }>> => {
      const response = await apiClient.post(`/polls/${pollId}/end`);
      return response.data;
    },
    
    getActive: async (): Promise<ApiResponse<{ poll: Poll | null; remainingTime: number | null }>> => {
      const response = await apiClient.get('/polls/active');
      return response.data;
    },
    
    getResults: async (pollId: string): Promise<ApiResponse<{ results: PollResults }>> => {
      const response = await apiClient.get(`/polls/${pollId}/results`);
      return response.data;
    },
    
    getHistory: async (page: number = 1, limit: number = 10): Promise<ApiResponse<{ history: PollHistory[]; pagination: { page: number; limit: number } }>> => {
      const response = await apiClient.get('/polls/history', { params: { page, limit } });
      return response.data;
    },
  },
  
  votes: {
    submit: async (data: SubmitVoteDto): Promise<ApiResponse<{ vote: any; results: any }>> => {
      const response = await apiClient.post('/votes', data);
      return response.data;
    },
  },
};

