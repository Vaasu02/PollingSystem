import { createContext, useContext, ReactNode } from 'react';
import { useSession } from '../hooks/useSession';
import type { Session, SessionState } from '../types/user.types';

interface SessionContextType {
  session: Session | null;
  sessionId: string | null;
  userType: 'teacher' | 'student' | null;
  userName: string | null;
  isLoading: boolean;
  error: string | null;
  createSession: (data: { userType: 'teacher' | 'student'; userName: string }) => Promise<string | undefined>;
  getSessionState: () => Promise<SessionState | null>;
  clearSession: () => void;
  isSessionValid: boolean;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider = ({ children }: { children: ReactNode }) => {
  const sessionData = useSession();

  return (
    <SessionContext.Provider value={sessionData}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessionContext must be used within SessionProvider');
  }
  return context;
};

