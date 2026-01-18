import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { SOCKET_URL } from '../utils/constants';
import type { CreatePollPayload, StartPollPayload, SubmitVotePayload, EndPollPayload, RequestStatePayload, ChatMessagePayload } from '../types/socket.types';

class SocketService {
  private socket: Socket | null = null;
  
  connect(sessionId: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }
    
    this.socket = io(SOCKET_URL, {
      auth: { sessionId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    
    return this.socket;
  }
  
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
  
  getSocket(): Socket | null {
    return this.socket;
  }
  
  isConnected(): boolean {
    return this.socket?.connected || false;
  }
  
  joinSession(sessionId: string): void {
    this.socket?.emit('join_session', { sessionId });
  }
  
  createPoll(data: CreatePollPayload): void {
    this.socket?.emit('create_poll', data);
  }
  
  startPoll(data: StartPollPayload): void {
    this.socket?.emit('start_poll', data);
  }
  
  submitVote(data: SubmitVotePayload): void {
    this.socket?.emit('submit_vote', data);
  }
  
  endPoll(data: EndPollPayload): void {
    this.socket?.emit('end_poll', data);
  }
  
  requestState(data: RequestStatePayload): void {
    this.socket?.emit('request_state', data);
  }
  
  sendChatMessage(data: ChatMessagePayload): void {
    this.socket?.emit('chat_message', data);
  }
  
  on(event: string, callback: (...args: any[]) => void): void {
    this.socket?.on(event, callback);
  }
  
  off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }
}

export const socketService = new SocketService();

