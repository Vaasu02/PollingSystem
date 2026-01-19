import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { usePollContext } from '../../context/PollContext';
import { useSocket } from '../../hooks/useSocket';
import { usePollTimer } from '../../hooks/usePollTimer';
import { api } from '../../services/api';
import { LuAlarmClock, LuHistory } from 'react-icons/lu';

const PollDashboard = () => {
  const [results, setResults] = useState<any>(null);
  const navigate = useNavigate();
  const { sessionId } = useSessionContext();
  const { activePoll, setActivePoll, setPollResults } = usePollContext();
  const { on } = useSocket(sessionId);

  const remainingTime = activePoll?.startTime && activePoll?.endTime
    ? Math.max(0, Math.floor((new Date(activePoll.endTime).getTime() - Date.now()) / 1000))
    : null;

  const { formattedTime } = usePollTimer(remainingTime, activePoll?.status === 'active');

  useEffect(() => {
    if (!activePoll) {
      loadActivePoll();
    } else {
      loadResults();
    }
  }, [activePoll]);

  useEffect(() => {
    if (!on || !activePoll) return;

    const handleVoteReceived = (data: any) => {
      console.log('Vote received event:', data);
      if (data.pollId === activePoll._id && data.results) {
        console.log('Updating results:', data.results);
        setResults(data.results);
      }
    };

    const handlePollEnded = (data: any) => {
      console.log('Poll ended event:', data);
      if (data.pollId === activePoll._id) {
        setActivePoll({ ...activePoll, status: 'ended' });
        if (data.finalResults) {
          setPollResults(data.finalResults);
          setResults(data.finalResults);
        }
      }
    };

    on('vote_received', handleVoteReceived);
    on('poll_ended', handlePollEnded);

    return () => {};
  }, [on, activePoll, setPollResults, setActivePoll]);

  const loadActivePoll = async () => {
    try {
      const response = await api.polls.getActive();
      if (response.data.poll) {
        setActivePoll(response.data.poll);
      }
    } catch (error) {
      console.error('Failed to load active poll:', error);
    }
  };

  const loadResults = async () => {
    if (!activePoll) return;
    try {
      const response = await api.polls.getResults(activePoll._id);
      setResults(response.data.results);
    } catch (error) {
      console.error('Failed to load results:', error);
    }
  };

  const handleAskNewQuestion = () => {
    navigate('/teacher/create');
  };

  if (!activePoll) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#6E6E6E] mb-4">No active poll</p>
          <button
            onClick={handleAskNewQuestion}
            className="px-6 py-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-3xl hover:opacity-90"
          >
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#373737]">Question</h1>
          <div className="flex items-center gap-4">
            {activePoll.status === 'active' && (
              <div className="flex items-center gap-2 text-[#F44336]">
                <LuAlarmClock className="text-xl" />
                <span className="text-lg font-semibold">{formattedTime}</span>
              </div>
            )}
            <button
              onClick={() => navigate('/teacher/history')}
              className="px-4 py-2 bg-[#7765DA] text-white rounded-3xl hover:opacity-90 flex items-center gap-2"
            >
              <LuHistory className="text-lg" /> View Poll history
            </button>
          </div>
        </div>

        <div className="border border-[#6E6E6E] rounded-[10px] overflow-hidden mb-6 bg-white">
          <div className="text-white px-4 py-4" style={{ background: 'linear-gradient(90deg, #343434 0%, #6E6E6E 100%)' }}>
            <p className="text-[17px] font-semibold">{activePoll.question}</p>
          </div>

          {results && (
            <div className="p-4 space-y-3">
              {results.options?.map((option: any, index: number) => {
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
          )}
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleAskNewQuestion}
            className="px-6 py-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-3xl hover:opacity-90 flex items-center gap-2"
          >
            <span>+</span> Ask a new question
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollDashboard;

