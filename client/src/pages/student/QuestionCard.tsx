import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { usePollContext } from '../../context/PollContext';
import { useSocket } from '../../hooks/useSocket';
import { usePollTimer } from '../../hooks/usePollTimer';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';

const QuestionCard = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(true);
  const isKickedRef = useRef(false);
  const navigate = useNavigate();
  const { sessionId, userName, clearSession } = useSessionContext();
  const { activePoll, setActivePoll, setPollResults } = usePollContext();
  const { socket } = useSocket(sessionId);

  useEffect(() => {
    const validateSession = async () => {
      if (isKickedRef.current) return;
      
      if (!sessionId) {
        navigate('/');
        return;
      }
      
      try {
        await api.sessions.getState(sessionId);
        setIsValidSession(true);
      } catch (error: any) {
        console.log('Session validation error:', error.message);
        setIsValidSession(false);
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
  
  const remainingTime = activePoll?.startTime 
    ? Math.max(0, Math.floor((new Date(activePoll.endTime!).getTime() - Date.now()) / 1000))
    : null;
  
  const { formattedTime, isExpired } = usePollTimer(remainingTime, activePoll?.status === 'active');

  useEffect(() => {
    if (!socket || !activePoll) return;

    const handlePollEnded = async (data: any) => {
      console.log('Poll ended event received:', data);
      if (data.finalResults) {
        setPollResults(data.finalResults);
      }
      navigate('/student/results');
    };

    const handleTimerUpdate = (data: any) => {
      if (data.pollId === activePoll._id && data.remainingTime !== undefined) {
        if (data.remainingTime <= 0) {
          navigate('/student/results');
        }
      }
    };

    const handleStudentKicked = (data: any) => {
      console.log('Student kicked event:', data);
      if (data.targetSessionId === sessionId) {
        isKickedRef.current = true;
        clearSession();
        navigate('/kicked');
      }
    };

    socket.on('poll_ended', handlePollEnded);
    socket.on('timer_update', handleTimerUpdate);
    socket.on('student_kicked', handleStudentKicked);

    return () => {
      socket.off('poll_ended', handlePollEnded);
      socket.off('timer_update', handleTimerUpdate);
      socket.off('student_kicked', handleStudentKicked);
    };
  }, [socket, activePoll, navigate, setPollResults, sessionId, clearSession]);

  useEffect(() => {
    if (isExpired && !hasVoted) {
      navigate('/student/results');
    }
  }, [isExpired, hasVoted, navigate]);

  const handleSubmit = async () => {
    if (!selectedOption || !activePoll || !sessionId || !userName || hasVoted) return;

    try {
      setIsSubmitting(true);
      
      socketService.submitVote({
        pollId: activePoll._id,
        optionId: selectedOption,
        studentName: userName,
        studentSessionId: sessionId,
      });
      
      setHasVoted(true);
      
      setTimeout(async () => {
        try {
          const results = await api.polls.getResults(activePoll._id);
          setPollResults(results.data.results);
        } catch (e) {
          console.error('Failed to get results:', e);
        }
        navigate('/student/results');
      }, 500);
    } catch (error: any) {
      console.error('Failed to submit vote:', error);
      alert(error.message || 'Failed to submit vote');
      setIsSubmitting(false);
    }
  };

  if (!activePoll) {
    return <div>No active poll</div>;
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-[#373737]">Question 1</h2>
          <div className="flex items-center gap-2">
            <span className="text-xl">⏰</span>
            <span className={`text-lg font-semibold ${parseInt(formattedTime.split(':')[1]) < 10 ? 'text-[#F44336]' : 'text-[#373737]'}`}>
              {formattedTime}
            </span>
          </div>
        </div>

        <div className="bg-[#373737] text-white p-6 rounded-lg mb-6">
          <p className="text-lg">{activePoll.question}</p>
        </div>

        <div className="space-y-4 mb-6">
          {activePoll.options.map((option, index) => (
            <div
              key={option._id || index}
              onClick={() => !hasVoted && !isExpired && setSelectedOption(option._id || '')}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedOption === option._id
                  ? 'border-[#7765DA] bg-[#F2F2F2]'
                  : 'border-[#F2F2F2] bg-white hover:border-[#6E6E6E]'
              } ${hasVoted || isExpired ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  selectedOption === option._id ? 'bg-[#7765DA] text-white' : 'bg-[#F2F2F2] text-[#373737]'
                } font-semibold`}>
                  {index + 1}
                </div>
                <span className="text-[#373737] font-medium">{option.text}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selectedOption || hasVoted || isExpired || isSubmitting}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition-all ${
              selectedOption && !hasVoted && !isExpired && !isSubmitting
                ? 'bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] hover:opacity-90 cursor-pointer'
                : 'bg-[#6E6E6E] cursor-not-allowed opacity-50'
            }`}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;

