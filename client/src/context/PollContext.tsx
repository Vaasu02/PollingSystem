import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Poll, PollResults, PollHistory } from '../types/poll.types';

interface PollContextType {
  activePoll: Poll | null;
  pollResults: PollResults | null;
  pollHistory: PollHistory[];
  setActivePoll: (poll: Poll | null) => void;
  setPollResults: (results: PollResults | null) => void;
  setPollHistory: (history: PollHistory[]) => void;
}

const PollContext = createContext<PollContextType | undefined>(undefined);

export const PollProvider = ({ children }: { children: ReactNode }) => {
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [pollResults, setPollResults] = useState<PollResults | null>(null);
  const [pollHistory, setPollHistory] = useState<PollHistory[]>([]);

  return (
    <PollContext.Provider
      value={{
        activePoll,
        pollResults,
        pollHistory,
        setActivePoll,
        setPollResults,
        setPollHistory,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePollContext = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePollContext must be used within PollProvider');
  }
  return context;
};

