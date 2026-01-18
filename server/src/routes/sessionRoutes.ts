import { Router } from 'express';
import {
  createSession,
  getSessionState,
  getParticipants,
  kickStudent,
} from '../controllers/sessionController';

const router = Router();

router.post('/', createSession);
router.get('/:sessionId/state', getSessionState);
router.get('/:sessionId/participants', getParticipants);
router.post('/kick', kickStudent);

export default router;

