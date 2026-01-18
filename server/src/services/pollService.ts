import { Poll } from '../models/Poll';
import { Vote } from '../models/Vote';
import { Session } from '../models/Session';
import { CreatePollDto, PollResults, PollHistory } from '../types/poll.types';
import { TimerService } from './timerService';

export class PollService {
  static async createPoll(data: CreatePollDto): Promise<any> {
    const poll = await Poll.create({
      question: data.question,
      options: data.options.map((opt) => ({
        text: opt.text,
        isCorrect: opt.isCorrect,
        voteCount: 0,
      })),
      duration: data.duration,
      status: 'draft',
      createdBy: data.createdBy,
      totalVotes: 0,
    });

    return poll;
  }

  static async startPoll(pollId: string, teacherSessionId: string): Promise<any> {
    const activePoll = await Poll.findOne({ status: 'active' });
    
    if (activePoll) {
      if (TimerService.isPollExpired(activePoll)) {
        activePoll.status = 'ended';
        await activePoll.save();
      } else {
        throw new Error('Cannot start poll. Another poll is currently active. Please end it first.');
      }
    }

    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.status !== 'draft') {
      throw new Error('Poll is not in draft status');
    }

    const now = new Date();
    const endTime = new Date(now.getTime() + poll.duration * 1000);

    poll.status = 'active';
    poll.startTime = now;
    poll.endTime = endTime;
    await poll.save();

    await Session.updateMany(
      { isActive: true },
      { currentPollId: pollId }
    );

    return poll;
  }

  static async endPoll(pollId: string): Promise<any> {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.status !== 'active') {
      throw new Error('Poll is not active');
    }

    poll.status = 'ended';
    await poll.save();

    return poll;
  }

  static async getActivePoll(): Promise<any | null> {
    let poll = await Poll.findOne({ status: 'active' });
    
    if (poll && TimerService.isPollExpired(poll)) {
      poll.status = 'ended';
      await poll.save();
      poll = null;
    }
    
    if (!poll) {
      poll = await Poll.findOne({ status: 'draft' }).sort({ createdAt: -1 });
    }
    
    return poll;
  }

  static async getPollHistory(page: number = 1, limit: number = 10): Promise<PollHistory[]> {
    const skip = (page - 1) * limit;
    
    const polls = await Poll.find({ status: 'ended' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const history: PollHistory[] = [];

    for (const poll of polls) {
      const votes = await Vote.find({ pollId: poll._id.toString() });
      const totalVotes = votes.length || poll.totalVotes;

      const options = poll.options.map((opt) => {
        const voteCount = opt.voteCount;
        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
        return {
          text: opt.text,
          voteCount,
          percentage,
        };
      });

      history.push({
        pollId: poll._id.toString(),
        question: poll.question,
        options,
        totalVotes,
        endedAt: poll.endTime || poll.updatedAt,
        createdAt: poll.createdAt,
      });
    }

    return history;
  }

  static async getPollResults(pollId: string): Promise<PollResults> {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const votes = await Vote.find({ pollId });
    const totalVotes = votes.length || poll.totalVotes;

    const options = poll.options.map((opt) => {
      const voteCount = opt.voteCount;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      return {
        id: opt._id?.toString() || '',
        text: opt.text,
        voteCount,
        percentage,
      };
    });

    return {
      pollId: poll._id.toString(),
      question: poll.question,
      options,
      totalVotes,
    };
  }

  static async canCreateNewPoll(): Promise<boolean> {
    const activePoll = await Poll.findOne({ status: 'active' });
    
    if (!activePoll) {
      return true;
    }

    if (TimerService.isPollExpired(activePoll)) {
      await this.endPoll(activePoll._id.toString());
      return true;
    }

    const activeStudents = await Session.countDocuments({
      currentPollId: activePoll._id.toString(),
      userType: 'student',
      isActive: true,
    });

    const votesCount = await Vote.countDocuments({
      pollId: activePoll._id.toString(),
    });

    return votesCount >= activeStudents;
  }
}

