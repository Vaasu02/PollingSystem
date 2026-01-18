export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const MAX_QUESTION_LENGTH = 100;
export const DEFAULT_POLL_DURATION = 60;
export const MIN_OPTIONS = 2;

export const POLL_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  ENDED: 'ended',
} as const;

export const USER_TYPE = {
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export const STORAGE_KEYS = {
  SESSION_ID: 'sessionId',
  USER_NAME: 'userName',
  USER_TYPE: 'userType',
} as const;

