import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { SessionProvider, useSessionContext } from './context/SessionContext';
import { PollProvider, usePollContext } from './context/PollContext';
import RoleSelection from './pages/RoleSelection';
import NameInput from './pages/student/NameInput';
import WaitingScreen from './pages/student/WaitingScreen';
import QuestionCard from './pages/student/QuestionCard';
import ResultsView from './pages/student/ResultsView';
import CreatePollForm from './pages/teacher/CreatePollForm';
import PollDashboard from './pages/teacher/PollDashboard';
import PollHistory from './pages/teacher/PollHistory';
import KickedOut from './pages/KickedOut';
import FloatingChat from './components/chat/FloatingChat';
import { storage } from './utils/storage';
import { api } from './services/api';

const StateRecovery = () => {
  const { getSessionState, clearSession, userType } = useSessionContext();
  const { setActivePoll, setPollResults } = usePollContext();
  const [isRecovering, setIsRecovering] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const recoverState = async () => {
      const savedSessionId = storage.getSessionId();
      if (!savedSessionId) {
        setIsRecovering(false);
        return;
      }

      try {
        const state = await getSessionState();
        if (state) {
          if (state.activePoll) {
            setActivePoll(state.activePoll);
          }
          if (state.pollResults) {
            setPollResults(state.pollResults);
          }
        }

        if (userType === 'student' && location.pathname.startsWith('/student')) {
          const pollResponse = await api.polls.getActive();
          const poll = pollResponse.data.poll;
          
          if (poll && poll.status === 'active') {
            setActivePoll(poll);
            setPollResults(null);
            if (location.pathname !== '/student/question') {
              navigate('/student/question');
            }
          } else if (!poll || poll.status !== 'active') {
            if (location.pathname === '/student/question') {
              navigate('/student/waiting');
            }
          }
        }
      } catch (error: any) {
        console.error('State recovery failed:', error);
        if (error.message?.includes('kicked')) {
          console.log('Session was kicked');
          clearSession();
          navigate('/kicked');
        } else if (error.message?.includes('Session not found') || error.message?.includes('not found')) {
          console.log('Clearing invalid session');
          clearSession();
        }
      } finally {
        setIsRecovering(false);
      }
    };

    recoverState();
  }, []);

  if (isRecovering) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#6E6E6E]">Loading...</div>
      </div>
    );
  }

  return null;
};

const FloatingChatWrapper = () => {
  const { sessionId } = useSessionContext();
  const location = useLocation();
  
  const showChat = sessionId && 
    !location.pathname.includes('/kicked') && 
    location.pathname !== '/' &&
    location.pathname !== '/student/name';
  
  if (!showChat) return null;
  
  return <FloatingChat />;
};

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <PollProvider>
          <StateRecovery />
          <Routes>
            <Route path="/" element={<RoleSelection />} />
            
            <Route path="/student">
              <Route path="name" element={<NameInput />} />
              <Route path="waiting" element={<WaitingScreen />} />
              <Route path="question" element={<QuestionCard />} />
              <Route path="results" element={<ResultsView />} />
            </Route>
            
            <Route path="/teacher">
              <Route path="create" element={<CreatePollForm />} />
              <Route path="dashboard" element={<PollDashboard />} />
              <Route path="history" element={<PollHistory />} />
            </Route>
            
            <Route path="/kicked" element={<KickedOut />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <FloatingChatWrapper />
        </PollProvider>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
