import { Router } from 'express';
import {
  createPoll,
  startPoll,
  endPoll,
  getActivePoll,
  getPollResults,
} from '../controllers/pollController';

const router = Router();

router.post('/', createPoll);
router.post('/:pollId/start', startPoll);
router.post('/:pollId/end', endPoll);
router.get('/active', getActivePoll);
router.get('/:pollId/results', getPollResults);

export default router;

