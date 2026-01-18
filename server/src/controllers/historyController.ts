import { Request, Response } from 'express';
import { PollService } from '../services/pollService';
import { asyncHandler } from '../middleware/asyncHandler';

export const getPollHistory = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const limit = parseInt(req.query.limit as string, 10) || 10;

  const history = await PollService.getPollHistory(page, limit);

  res.json({
    success: true,
    data: { history },
    pagination: {
      page,
      limit,
    },
  });
});

