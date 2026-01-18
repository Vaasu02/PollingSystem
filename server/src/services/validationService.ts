import { CreatePollDto } from '../types/poll.types';
import { SubmitVoteDto } from '../types/vote.types';
import { CreateSessionDto } from '../types/user.types';
import { MAX_QUESTION_LENGTH } from '../utils/constants';

export class ValidationService {
  static validateCreatePoll(data: any): CreatePollDto {
    if (!data.question || typeof data.question !== 'string') {
      throw new Error('Question is required and must be a string');
    }

    if (data.question.length > MAX_QUESTION_LENGTH) {
      throw new Error(`Question must be less than ${MAX_QUESTION_LENGTH} characters`);
    }

    if (!Array.isArray(data.options) || data.options.length < 2) {
      throw new Error('Poll must have at least 2 options');
    }

    const validatedOptions = data.options.map((opt: any) => {
      if (!opt.text || typeof opt.text !== 'string') {
        throw new Error('Each option must have a text property');
      }
      return {
        text: opt.text,
        isCorrect: Boolean(opt.isCorrect),
      };
    });

    const duration = parseInt(data.duration, 10);
    if (isNaN(duration) || duration < 1) {
      throw new Error('Duration must be a positive number');
    }

    if (!data.createdBy || typeof data.createdBy !== 'string') {
      throw new Error('createdBy is required');
    }

    return {
      question: data.question.trim(),
      options: validatedOptions,
      duration,
      createdBy: data.createdBy,
    };
  }

  static validateSubmitVote(data: any): SubmitVoteDto {
    if (!data.pollId || typeof data.pollId !== 'string') {
      throw new Error('pollId is required');
    }

    if (!data.optionId || typeof data.optionId !== 'string') {
      throw new Error('optionId is required');
    }

    if (!data.studentName || typeof data.studentName !== 'string') {
      throw new Error('studentName is required');
    }

    if (!data.studentSessionId || typeof data.studentSessionId !== 'string') {
      throw new Error('studentSessionId is required');
    }

    return {
      pollId: data.pollId,
      optionId: data.optionId,
      studentName: data.studentName.trim(),
      studentSessionId: data.studentSessionId,
    };
  }

  static validateCreateSession(data: any): CreateSessionDto {
    if (!data.userType || !['teacher', 'student'].includes(data.userType)) {
      throw new Error('userType must be either teacher or student');
    }

    if (!data.userName || typeof data.userName !== 'string') {
      throw new Error('userName is required and must be a string');
    }

    return {
      userType: data.userType,
      userName: data.userName.trim(),
    };
  }
}

