import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../../context/SessionContext';
import { usePollContext } from '../../context/PollContext';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';
import { socketService } from '../../services/socketService';

const PollDashboard = () => {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { sessionId } = useSessionContext();
  const { activePoll, setActivePoll, setPollResults } = usePollContext();
  const { on } = useSocket(sessionId);

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

    return () => {
      // Cleanup handled by useSocket
    };
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

  const handleStartPoll = async () => {
    if (!activePoll || !sessionId) return;
    try {
      setIsLoading(true);
      const response = await api.polls.start(activePoll._id, sessionId);
      setActivePoll({ ...activePoll, status: 'active', startTime: response.data.startTime });
      socketService.startPoll({ pollId: activePoll._id, teacherSessionId: sessionId });
      loadResults();
    } catch (error: any) {
      alert(error.message || 'Failed to start poll');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndPoll = async () => {
    if (!activePoll) return;
    try {
      setIsLoading(true);
      await api.polls.end(activePoll._id);
      setActivePoll({ ...activePoll, status: 'ended' });
      socketService.endPoll({ pollId: activePoll._id });
      loadResults();
    } catch (error: any) {
      alert(error.message || 'Failed to end poll');
    } finally {
      setIsLoading(false);
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
            className="px-6 py-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-lg hover:opacity-90"
          >
            Create New Poll
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#373737]">Question</h1>
          <button
            onClick={() => navigate('/teacher/history')}
            className="px-4 py-2 bg-[#7765DA] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <span>👁️</span> View Poll history
          </button>
        </div>

        <div className="bg-[#373737] text-white p-6 rounded-lg mb-6">
          <p className="text-lg">{activePoll.question}</p>
          <div className="mt-2 flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-semibold ${
              activePoll.status === 'draft' ? 'bg-yellow-500' :
              activePoll.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
            }`}>
              {activePoll.status.toUpperCase()}
            </span>
          </div>
        </div>

        {activePoll.status === 'draft' && (
          <div className="mb-6">
            <p className="text-[#6E6E6E] mb-4">Poll is ready. Click "Start Poll" to begin.</p>
            <button
              onClick={handleStartPoll}
              disabled={isLoading}
              className="px-6 py-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? 'Starting...' : 'Start Poll'}
            </button>
          </div>
        )}

        {activePoll.status === 'active' && results && (
          <div className="space-y-4 mb-6">
            {results.options?.map((option: any, index: number) => (
              <div key={option.id || index} className="bg-white border border-[#F2F2F2] rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#7765DA] text-white flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-[#373737] font-medium flex-1">{option.text}</span>
                  <span className="text-[#373737] font-semibold">{option.percentage}%</span>
                </div>
                <div className="w-full bg-[#F2F2F2] rounded-full h-3">
                  <div
                    className="bg-[#7765DA] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
            <button
              onClick={handleEndPoll}
              disabled={isLoading}
              className="mt-4 px-6 py-2 bg-[#F44336] text-white rounded-lg hover:opacity-90 disabled:opacity-50"
            >
              End Poll
            </button>
          </div>
        )}

        {activePoll.status === 'ended' && results && (
          <div className="space-y-4 mb-6">
            {results.options?.map((option: any, index: number) => (
              <div key={option.id || index} className="bg-white border border-[#F2F2F2] rounded-lg p-4">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#7765DA] text-white flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <span className="text-[#373737] font-medium flex-1">{option.text}</span>
                  <span className="text-[#373737] font-semibold">{option.percentage}%</span>
                </div>
                <div className="w-full bg-[#F2F2F2] rounded-full h-3">
                  <div
                    className="bg-[#7765DA] h-3 rounded-full transition-all duration-300"
                    style={{ width: `${option.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center">
          <button
            onClick={handleAskNewQuestion}
            className="px-6 py-2 bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] text-white rounded-lg hover:opacity-90 flex items-center gap-2"
          >
            <span>+</span> Ask a new question
          </button>
        </div>
      </div>
    </div>
  );
};

export default PollDashboard;

