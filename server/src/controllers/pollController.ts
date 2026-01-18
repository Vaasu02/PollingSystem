import { Request, Response } from 'express';
import { PollService } from '../services/pollService';
import { ValidationService } from '../services/validationService';
import { TimerService } from '../services/timerService';
import { asyncHandler } from '../middleware/asyncHandler';

export const createPoll = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = ValidationService.validateCreatePoll({
    ...req.body,
    createdBy: req.body.sessionId || req.body.createdBy,
  });

  const poll = await PollService.createPoll(validatedData);

  res.status(201).json({
    success: true,
    data: { poll },
  });
});

export const startPoll = asyncHandler(async (req: Request, res: Response) => {
  const pollId = req.params.pollId as string;
  const teacherSessionId = req.body.sessionId || req.body.teacherSessionId;

  if (!teacherSessionId) {
    return res.status(400).json({
      success: false,
      message: 'Teacher session ID is required',
    });
  }

  const poll = await PollService.startPoll(pollId, teacherSessionId);

  res.json({
    success: true,
    data: {
      poll,
      startTime: poll.startTime,
      duration: poll.duration,
    },
  });
});

export const endPoll = asyncHandler(async (req: Request, res: Response) => {
  const pollId = req.params.pollId as string;
  const poll = await PollService.endPoll(pollId);
  const results = await PollService.getPollResults(pollId);

  res.json({
    success: true,
    data: {
      poll,
      results,
    },
  });
});

export const getActivePoll = asyncHandler(async (req: Request, res: Response) => {
  const poll = await PollService.getActivePoll();

  if (!poll) {
    return res.json({
      success: true,
      data: { poll: null },
    });
  }

  const remainingTime = TimerService.calculateRemainingTime(poll);

  res.json({
    success: true,
    data: {
      poll,
      remainingTime,
    },
  });
});

export const getPollResults = asyncHandler(async (req: Request, res: Response) => {
  const pollId = req.params.pollId as string;
  const results = await PollService.getPollResults(pollId);

  res.json({
    success: true,
    data: { results },
  });
});

