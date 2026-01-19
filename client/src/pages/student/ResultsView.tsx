import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { usePollContext } from '../../context/PollContext';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';

const ResultsView = () => {
  const navigate = useNavigate();
  const { sessionId, clearSession } = useSessionContext();
  const { activePoll, pollResults, setActivePoll, setPollResults } = usePollContext();
  const { socket } = useSocket(sessionId);
  const [isLoading, setIsLoading] = useState(false);
  const [localResults, setLocalResults] = useState<any>(pollResults);
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

  useEffect(() => {
    const fetchResults = async () => {
      if (!activePoll) return;
      
      try {
        setIsLoading(true);
        const response = await api.polls.getResults(activePoll._id);
        const results = response.data.results;
        setLocalResults(results);
        setPollResults(results);
      } catch (error) {
        console.error('Failed to fetch results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!pollResults && activePoll) {
      fetchResults();
    } else if (pollResults) {
      setLocalResults(pollResults);
    }
  }, [activePoll, pollResults, setPollResults]);

  useEffect(() => {
    const checkForNewPoll = async () => {
      if (hasNavigated.current) return;
      
      try {
        const response = await api.polls.getActive();
        const poll = response.data.poll;
        
        if (poll && poll.status === 'active') {
          if (!activePoll || poll._id !== activePoll._id) {
            hasNavigated.current = true;
            setActivePoll(poll);
            setPollResults(null);
            navigate('/student/question');
          }
        }
      } catch (error) {
        console.error('Failed to check for new poll:', error);
      }
    };

    checkForNewPoll();
    
    const pollInterval = setInterval(checkForNewPoll, 3000);
    return () => clearInterval(pollInterval);
  }, [activePoll, navigate, setActivePoll, setPollResults]);

  useEffect(() => {
    if (!socket) return;

    const handlePollStarted = (data: any) => {
      console.log('Poll started event in results:', data);
      if (data.poll && !hasNavigated.current) {
        hasNavigated.current = true;
        setActivePoll(data.poll);
        setPollResults(null);
        navigate('/student/question');
      }
    };

    const handleVoteReceived = (data: any) => {
      if (data.results && activePoll && data.pollId === activePoll._id) {
        setLocalResults(data.results);
      }
    };

    const handlePollEnded = (data: any) => {
      if (data.finalResults) {
        setLocalResults(data.finalResults);
        setPollResults(data.finalResults);
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
    socket.on('vote_received', handleVoteReceived);
    socket.on('poll_ended', handlePollEnded);
    socket.on('student_kicked', handleStudentKicked);

    return () => {
      socket.off('poll_started', handlePollStarted);
      socket.off('vote_received', handleVoteReceived);
      socket.off('poll_ended', handlePollEnded);
      socket.off('student_kicked', handleStudentKicked);
    };
  }, [socket, navigate, setActivePoll, setPollResults, activePoll, sessionId, clearSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#6E6E6E]">Loading results...</div>
      </div>
    );
  }

  if (!activePoll) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6E6E6E] mb-4">No active poll</p>
          <button
            onClick={() => navigate('/student/waiting')}
            className="px-6 py-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-lg hover:opacity-90"
          >
            Go to Waiting Room
          </button>
        </div>
      </div>
    );
  }

  if (!localResults) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#6E6E6E]">Loading results...</div>
      </div>
    );
  }

  const options = localResults.options || [];

  return (
    <div className="min-h-screen bg-white px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="border border-[#6E6E6E] rounded-[10px] overflow-hidden mb-6 bg-white">
          <div className="text-white px-4 py-4" style={{ background: 'linear-gradient(90deg, #343434 0%, #6E6E6E 100%)' }}>
            <p className="text-[17px] font-semibold">{activePoll.question}</p>
          </div>

          <div className="p-4 space-y-3">
            {options.map((option: any, index: number) => {
              const hasFill = (option.percentage || 0) > 0;
              return (
                <div key={option.id || index} className="relative h-[50px] rounded-[8px] overflow-hidden border border-[#E0E0E0]">
                  <div 
                    className="absolute inset-y-0 left-0 bg-[#7765DA] transition-all duration-300"
                    style={{ width: `${option.percentage || 0}%` }}
                  ></div>
                  <div className="absolute inset-0 flex items-center px-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 z-10 ${hasFill ? 'bg-white text-[#7765DA]' : 'bg-[#7765DA] text-white'}`}>
                      {index + 1}
                    </div>
                    <span className={`ml-3 font-medium flex-1 z-10 ${hasFill ? 'text-white' : 'text-[#373737]'}`}>{option.text}</span>
                    <span className="text-[#373737] font-semibold z-10">{option.percentage || 0}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-[#373737] text-lg">
          Wait for the teacher to ask a new question..
        </p>
      </div>
    </div>
  );
};

export default ResultsView;

