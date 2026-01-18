import { v4 as uuidv4 } from 'uuid';
import { Session } from '../models/Session';
import { Poll } from '../models/Poll';
import { Vote } from '../models/Vote';
import { CreateSessionDto, SessionState } from '../types/user.types';
import { TimerService } from './timerService';
import { VoteService } from './voteService';

export class SessionService {
  static async createSession(data: CreateSessionDto): Promise<any> {
    const sessionId = uuidv4();
    
    const session = await Session.create({
      sessionId,
      userType: data.userType,
      userName: data.userName,
      joinedAt: new Date(),
      lastActiveAt: new Date(),
      isActive: true,
    });

    return session;
  }

  static async getSessionState(sessionId: string): Promise<SessionState> {
    const session = await Session.findOne({ sessionId });
    if (!session) {
      throw new Error('Session not found');
    }

    if (!session.isActive) {
      throw new Error('Session has been kicked');
    }

    const activePoll = await Poll.findOne({ status: 'active' });
    
    let remainingTime: number | null = null;
    let hasVoted = false;
    let selectedOption: string | null = null;
    let pollResults: any = null;

    if (activePoll) {
      remainingTime = TimerService.getTimerForStudent(activePoll);
      
      if (session.userType === 'student') {
        const vote = await Vote.findOne({
          pollId: activePoll._id.toString(),
          studentSessionId: sessionId,
        });
        
        if (vote) {
          hasVoted = true;
          selectedOption = vote.optionId;
        }
      }

      if (activePoll.status === 'ended' || remainingTime === 0) {
        const counts = await VoteService.getVoteCounts(activePoll._id.toString());
        pollResults = {
          pollId: activePoll._id.toString(),
          question: activePoll.question,
          options: activePoll.options.map((opt) => {
            const optId = opt._id?.toString() || '';
            return {
              id: optId,
              text: opt.text,
              voteCount: counts[optId]?.voteCount || 0,
              percentage: counts[optId]?.percentage || 0,
            };
          }),
          totalVotes: activePoll.totalVotes,
        };
      }
    }

    return {
      session,
      activePoll: activePoll ? activePoll.toObject() : null,
      remainingTime,
      hasVoted,
      selectedOption,
      pollResults,
    };
  }

  static async updateSessionSocketId(sessionId: string, socketId: string): Promise<void> {
    await Session.updateOne(
      { sessionId },
      { 
        socketId,
        lastActiveAt: new Date(),
      }
    );
  }

  static async getActiveParticipants(pollId?: string): Promise<any[]> {
    const query: any = {
      isActive: true,
    };
    
    if (pollId) {
      query.currentPollId = pollId;
    }

    const participants = await Session.find(query).sort({ joinedAt: -1 });

    return participants.map(p => ({
      sessionId: p.sessionId,
      userName: p.userName,
      userType: p.userType,
      joinedAt: p.joinedAt,
    }));
  }

  static async kickStudent(sessionId: string): Promise<void> {
    await Session.updateOne(
      { sessionId },
      { isActive: false }
    );
  }

}

