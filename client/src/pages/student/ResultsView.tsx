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
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[#373737] text-white p-6 rounded-lg mb-6">
          <p className="text-lg">{activePoll.question}</p>
        </div>

        <div className="space-y-4 mb-6">
          {options.map((option: any, index: number) => (
            <div key={option.id || index} className="bg-white border border-[#F2F2F2] rounded-lg p-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#7765DA] text-white flex items-center justify-center font-semibold">
                  {index + 1}
                </div>
                <span className="text-[#373737] font-medium flex-1">{option.text}</span>
                <span className="text-[#373737] font-semibold">{option.percentage || 0}%</span>
              </div>
              <div className="w-full bg-[#F2F2F2] rounded-full h-3 mt-2">
                <div
                  className="bg-[#7765DA] h-3 rounded-full transition-all duration-300"
                  style={{ width: `${option.percentage || 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-[#373737] text-lg">
          Wait for the teacher to ask a new question..
        </p>
      </div>
    </div>
  );
};

export default ResultsView;

