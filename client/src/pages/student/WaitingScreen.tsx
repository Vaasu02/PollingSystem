import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { useSocket } from '../../hooks/useSocket';
import { usePollContext } from '../../context/PollContext';
import { api } from '../../services/api';

const WaitingScreen = () => {
  const navigate = useNavigate();
  const { sessionId, clearSession } = useSessionContext();
  const { setActivePoll } = usePollContext();
  const { socket } = useSocket(sessionId);
  const hasNavigated = useRef(false);
  const isKickedRef = useRef(false);

  useEffect(() => {
    const validateSession = async () => {
      if (isKickedRef.current) return;
      
      if (!sessionId) {
        navigate('/');
        return;
      }
      
      try {
        await api.sessions.getState(sessionId);
      } catch (error: any) {
        console.log('Session validation error:', error.message);
        if (error.message?.includes('kicked')) {
          isKickedRef.current = true;
          clearSession();
          navigate('/kicked');
        } else {
          clearSession();
          navigate('/');
        }
      }
    };
    
    validateSession();
  }, [sessionId, navigate, clearSession]);

  const checkActivePoll = async () => {
    if (hasNavigated.current) return;
    try {
      const response = await api.polls.getActive();
      if (response.data.poll && response.data.poll.status === 'active') {
        hasNavigated.current = true;
        setActivePoll(response.data.poll);
        navigate('/student/question');
      }
    } catch (error) {
      console.error('Failed to check active poll:', error);
    }
  };

  useEffect(() => {
    checkActivePoll();
    
    const pollInterval = setInterval(() => {
      checkActivePoll();
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [navigate, setActivePoll]);

  useEffect(() => {
    if (!socket) return;

    const handlePollStarted = (data: any) => {
      console.log('Poll started event received:', data);
      if (data.poll && !hasNavigated.current) {
        hasNavigated.current = true;
        setActivePoll(data.poll);
        navigate('/student/question');
      }
    };

    const handleStateRecovered = (data: any) => {
      console.log('State recovered:', data);
      if (data.activePoll && data.activePoll.status === 'active' && !hasNavigated.current) {
        hasNavigated.current = true;
        setActivePoll(data.activePoll);
        navigate('/student/question');
      }
    };

    const handleStudentKicked = (data: any) => {
      console.log('Student kicked event:', data);
      if (data.targetSessionId === sessionId) {
        hasNavigated.current = true;
        isKickedRef.current = true;
        clearSession();
        navigate('/kicked');
      }
    };

    socket.on('poll_started', handlePollStarted);
    socket.on('state_recovered', handleStateRecovered);
    socket.on('student_kicked', handleStudentKicked);

    return () => {
      socket.off('poll_started', handlePollStarted);
      socket.off('state_recovered', handleStateRecovered);
      socket.off('student_kicked', handleStudentKicked);
    };
  }, [socket, navigate, setActivePoll, sessionId, clearSession]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="flex flex-col items-center">
        <div className="mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] px-4 py-2 rounded-full flex items-center gap-2">
            <img src="/Vector.svg" alt="" className="w-4 h-4" />
            <span className="text-white font-semibold">Intervue Poll</span>
          </div>
        </div>

        <div className="w-16 h-16 border-4 border-[#7765DA] border-t-transparent rounded-full animate-spin mb-6"></div>

        <p className="text-[#373737] text-lg font-medium">
          Wait for the teacher to ask questions..
        </p>
      </div>
    </div>
  );
};

export default WaitingScreen;

