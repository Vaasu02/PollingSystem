import { Request, Response } from 'express';
import { VoteService } from '../services/voteService';
import { ValidationService } from '../services/validationService';
import { asyncHandler } from '../middleware/asyncHandler';

export const submitVote = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = ValidationService.validateSubmitVote(req.body);
  const { vote, results } = await VoteService.submitVote(validatedData);

  res.status(201).json({
    success: true,
    data: {
      vote,
      results,
    },
  });
});

