import { Vote } from '../models/Vote';
import { Poll } from '../models/Poll';
import { SubmitVoteDto, VoteCounts } from '../types/vote.types';
import { TimerService } from './timerService';

export class VoteService {
  static async submitVote(data: SubmitVoteDto): Promise<any> {
    const poll = await Poll.findById(data.pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    if (poll.status !== 'active') {
      throw new Error('Poll is not active');
    }

    if (TimerService.isPollExpired(poll)) {
      throw new Error('Poll has expired');
    }

    const existingVote = await Vote.findOne({
      pollId: data.pollId,
      studentSessionId: data.studentSessionId,
    });

    if (existingVote) {
      throw new Error('Student has already voted');
    }

    const option = poll.options.find((opt) => opt._id?.toString() === data.optionId);
    if (!option) {
      throw new Error('Option not found in poll');
    }

    try {
      const vote = await Vote.create({
        pollId: data.pollId,
        optionId: data.optionId,
        studentName: data.studentName,
        studentSessionId: data.studentSessionId,
        submittedAt: new Date(),
        pollQuestion: poll.question,
        selectedOption: option.text,
      });

      await Poll.findOneAndUpdate(
        { _id: data.pollId, 'options._id': data.optionId },
        { 
          $inc: { 
            totalVotes: 1,
            'options.$.voteCount': 1 
          } 
        }
      );

      const results = await this.getVoteCounts(data.pollId);
      return { vote, results };
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Duplicate vote detected');
      }
      throw error;
    }
  }

  static async hasStudentVoted(pollId: string, studentSessionId: string): Promise<boolean> {
    const vote = await Vote.findOne({
      pollId,
      studentSessionId,
    });
    return !!vote;
  }

  static async getVoteCounts(pollId: string): Promise<VoteCounts> {
    const poll = await Poll.findById(pollId);
    if (!poll) {
      throw new Error('Poll not found');
    }

    const votes = await Vote.find({ pollId });
    const totalVotes = votes.length || poll.totalVotes;

    const counts: VoteCounts = {};
    poll.options.forEach((option) => {
      const voteCount = option.voteCount;
      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;
      const optionId = option._id?.toString() || '';
      if (optionId) {
        counts[optionId] = {
          voteCount,
          percentage,
        };
      }
    });

    return counts;
  }
}

