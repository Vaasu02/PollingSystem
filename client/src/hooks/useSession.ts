import { useState } from 'react';
import { api } from '../services/api';
import { storage } from '../utils/storage';
import type { Session, CreateSessionDto, SessionState } from '../types/user.types';

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(storage.getSessionId());
  const [userType, setUserType] = useState<'teacher' | 'student' | null>(
    storage.getUserType() as 'teacher' | 'student' | null
  );
  const [userName, setUserName] = useState<string | null>(storage.getUserName());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createSession = async (data: CreateSessionDto) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.sessions.create(data);
      
      const newSessionId = response.data.sessionId;
      setSessionId(newSessionId);
      setSession(response.data.session);
      setUserType(data.userType);
      setUserName(data.userName);
      
      storage.setSessionId(newSessionId);
      storage.setUserType(data.userType);
      storage.setUserName(data.userName);
      
      return newSessionId;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getSessionState = async (): Promise<SessionState | null> => {
    if (!sessionId) return null;
    
    try {
      const response = await api.sessions.getState(sessionId);
      return response.data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const clearSession = () => {
    setSession(null);
    setSessionId(null);
    setUserType(null);
    setUserName(null);
    storage.clear();
  };

  return {
    session,
    sessionId,
    userType,
    userName,
    isLoading,
    error,
    createSession,
    getSessionState,
    clearSession,
    isSessionValid: !!sessionId,
  };
};

