import { Request, Response } from 'express';
import { SessionService } from '../services/sessionService';
import { ValidationService } from '../services/validationService';
import { asyncHandler } from '../middleware/asyncHandler';
import { getIO } from '../socket/socketHandler';

export const createSession = asyncHandler(async (req: Request, res: Response) => {
  const validatedData = ValidationService.validateCreateSession(req.body);
  const session = await SessionService.createSession(validatedData);

  res.status(201).json({
    success: true,
    data: {
      sessionId: session.sessionId,
      session,
    },
  });
});

export const getSessionState = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const state = await SessionService.getSessionState(sessionId);

  res.json({
    success: true,
    data: state,
  });
});

export const getParticipants = asyncHandler(async (req: Request, res: Response) => {
  const sessionId = req.params.sessionId as string;
  const session = await SessionService.getSessionState(sessionId);

  if (session.session.userType !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Only teachers can view participants',
    });
  }

  const participants = await SessionService.getActiveParticipants();

  res.json({
    success: true,
    data: { participants },
  });
});

export const kickStudent = asyncHandler(async (req: Request, res: Response) => {
  const teacherSessionId = req.body.teacherSessionId || req.query.teacherSessionId;
  const { targetSessionId } = req.body;

  if (!teacherSessionId) {
    return res.status(400).json({
      success: false,
      message: 'Teacher session ID is required',
    });
  }

  if (!targetSessionId) {
    return res.status(400).json({
      success: false,
      message: 'Target session ID is required',
    });
  }

  const teacherSession = await SessionService.getSessionState(teacherSessionId);
  if (teacherSession.session.userType !== 'teacher') {
    return res.status(403).json({
      success: false,
      message: 'Only teachers can kick students',
    });
  }

  await SessionService.kickStudent(targetSessionId);

  const io = getIO();
  io.emit('student_kicked', {
    targetSessionId,
    message: "You've been kicked out",
  });

  res.json({
    success: true,
    message: 'Student kicked successfully',
  });
});

