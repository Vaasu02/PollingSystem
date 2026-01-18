import { Server as SocketServer } from 'socket.io';
import { PollService } from '../services/pollService';
import { VoteService } from '../services/voteService';
import { SessionService } from '../services/sessionService';
import { TimerService } from '../services/timerService';
import { ValidationService } from '../services/validationService';
import { Poll } from '../models/Poll';
import { logger } from '../utils/logger';

export class PollSocketHandler {
  private io: SocketServer;
  private timerIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(io: SocketServer) {
    this.io = io;
  }

  setupHandlers(): void {
    this.io.on('connection', (socket) => {
      logger.info('Socket connected:', socket.id);

      socket.on('join_session', async (data: { sessionId: string }) => {
        try {
          const { sessionId } = data;
          await SessionService.updateSessionSocketId(sessionId, socket.id);

          const state = await SessionService.getSessionState(sessionId);
          socket.join(`session:${sessionId}`);

          if (state.activePoll) {
            socket.join(`poll:${state.activePoll._id}`);
          }

          if (state.session.userType === 'teacher') {
            socket.join('teachers');
          } else {
            socket.join('students');
          }

          socket.emit('state_recovered', state);

          if (state.activePoll && state.activePoll.status === 'active') {
            this.startTimerBroadcast(state.activePoll._id.toString());
          }
        } catch (error: any) {
          socket.emit('error', { message: error.message, code: 'JOIN_ERROR' });
        }
      });

      socket.on('create_poll', async (data: any) => {
        try {
          const validatedData = ValidationService.validateCreatePoll(data);
          const poll = await PollService.createPoll(validatedData);

          this.io.emit('poll_created', { poll });
        } catch (error: any) {
          socket.emit('error', { message: error.message, code: 'CREATE_POLL_ERROR' });
        }
      });

      socket.on('start_poll', async (data: { pollId: string; teacherSessionId: string }) => {
        try {
          const { pollId, teacherSessionId } = data;
          const poll = await PollService.startPoll(pollId, teacherSessionId);

          this.io.emit('poll_started', {
            poll,
            startTime: poll.startTime,
            duration: poll.duration,
          });

          this.io.sockets.sockets.forEach((s) => {
            s.join(`poll:${pollId}`);
          });

          this.startTimerBroadcast(pollId);
        } catch (error: any) {
          socket.emit('error', { message: error.message, code: 'START_POLL_ERROR' });
        }
      });

      socket.on('submit_vote', async (data: any) => {
        try {
          const validatedData = ValidationService.validateSubmitVote(data);
          const { vote, results } = await VoteService.submitVote(validatedData);

          const updatedPoll = await Poll.findById(validatedData.pollId);
          if (updatedPoll) {
            const totalVotes = updatedPoll.totalVotes;
            const pollResults = {
              pollId: validatedData.pollId,
              results: {
                options: updatedPoll.options.map((opt) => {
                  const optId = opt._id?.toString() || '';
                  const voteCount = opt.voteCount;
                  const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
                  return {
                    id: optId,
                    text: opt.text,
                    voteCount,
                    percentage,
                  };
                }),
                totalVotes,
              },
            };

            logger.info('Broadcasting vote_received to all clients');
            this.io.emit('vote_received', pollResults);
          }
        } catch (error: any) {
          socket.emit('error', { message: error.message, code: 'VOTE_ERROR' });
        }
      });

      socket.on('end_poll', async (data: { pollId: string }) => {
        try {
          const { pollId } = data;
          const poll = await PollService.endPoll(pollId);
          const results = await PollService.getPollResults(pollId);

          this.stopTimerBroadcast(pollId);

          this.io.to(`poll:${pollId}`).emit('poll_ended', {
            pollId,
            finalResults: results,
          });
        } catch (error: any) {
          socket.emit('error', { message: error.message, code: 'END_POLL_ERROR' });
        }
      });

      socket.on('request_state', async (data: { sessionId: string }) => {
        try {
          const state = await SessionService.getSessionState(data.sessionId);
          socket.emit('state_recovered', state);
        } catch (error: any) {
          socket.emit('error', { message: error.message, code: 'STATE_ERROR' });
        }
      });

      socket.on('disconnect', () => {
        logger.info('Socket disconnected:', socket.id);
      });
    });
  }

  private startTimerBroadcast(pollId: string): void {
    if (this.timerIntervals.has(pollId)) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const poll = await Poll.findById(pollId);
        if (!poll || poll.status !== 'active') {
          this.stopTimerBroadcast(pollId);
          return;
        }

        const remainingTime = TimerService.calculateRemainingTime(poll);
        
        if (remainingTime === null || remainingTime <= 0) {
          await PollService.endPoll(pollId);
          const results = await PollService.getPollResults(pollId);
          
          this.io.to(`poll:${pollId}`).emit('poll_ended', {
            pollId,
            finalResults: results,
          });
          
          this.stopTimerBroadcast(pollId);
          return;
        }

        this.io.to(`poll:${pollId}`).emit('timer_update', {
          pollId,
          remainingTime,
        });
      } catch (error) {
        logger.error('Timer broadcast error:', error);
        this.stopTimerBroadcast(pollId);
      }
    }, 1000);

    this.timerIntervals.set(pollId, interval);
  }

  private stopTimerBroadcast(pollId: string): void {
    const interval = this.timerIntervals.get(pollId);
    if (interval) {
      clearInterval(interval);
      this.timerIntervals.delete(pollId);
    }
  }
}

