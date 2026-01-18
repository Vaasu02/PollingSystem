import { Router } from 'express';
import { getPollHistory } from '../controllers/historyController';

const router = Router();

router.get('/', getPollHistory);

export default router;

