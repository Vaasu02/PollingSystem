import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePollContext } from '../../context/PollContext';
import { api } from '../../services/api';
import type { PollHistory as PollHistoryType } from '../../types/poll.types';

const PollHistory = () => {
  const [history, setHistory] = useState<PollHistoryType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { setPollHistory } = usePollContext();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      const response = await api.polls.getHistory(1, 10);
      setHistory(response.data.history);
      setPollHistory(response.data.history);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#6E6E6E]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#373737]">View Poll History</h1>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-4 py-2 bg-[#7765DA] text-white rounded-lg hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-6">
          {history.map((poll, index) => (
            <div key={poll.pollId} className="bg-white border border-[#F2F2F2] rounded-lg overflow-hidden">
              <div className="bg-[#373737] text-white p-4">
                <h3 className="text-lg font-semibold">Question {index + 1}</h3>
                <p className="text-sm mt-1">{poll.question}</p>
              </div>
              <div className="p-4 space-y-3">
                {poll.options.map((option, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-[#7765DA] flex-shrink-0"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[#373737]">{option.text}</span>
                        <span className="text-[#373737] font-semibold">{option.percentage}%</span>
                      </div>
                      <div className="w-full bg-[#F2F2F2] rounded-full h-2">
                        <div
                          className="bg-[#7765DA] h-2 rounded-full transition-all"
                          style={{ width: `${option.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {history.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#6E6E6E] text-lg">No poll history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PollHistory;

