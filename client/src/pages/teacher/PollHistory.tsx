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
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-[#373737]">View Poll History</h1>
          <button
            onClick={() => navigate('/teacher/dashboard')}
            className="px-4 py-2 bg-[#7765DA] text-white rounded-3xl hover:opacity-90"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="space-y-6">
          {history.map((poll, index) => (
            <div key={poll.pollId}>
              <h2 className="text-xl font-bold text-[#373737] mb-3">Question {index + 1}</h2>
              <div className="border border-[#6E6E6E] rounded-[10px] overflow-hidden bg-white">
                <div className="text-white px-4 py-4" style={{ background: 'linear-gradient(90deg, #343434 0%, #6E6E6E 100%)' }}>
                  <p className="text-[17px] font-semibold">{poll.question}</p>
                </div>
              
              <div className="p-4 space-y-3">
                {poll.options.map((option, optIndex) => {
                  const hasFill = (option.percentage || 0) > 0;
                  return (
                    <div key={optIndex} className="relative h-[50px] rounded-[8px] overflow-hidden border border-[#E0E0E0]">
                      <div 
                        className="absolute inset-y-0 left-0 bg-[#7765DA] transition-all duration-300"
                        style={{ width: `${option.percentage || 0}%` }}
                      ></div>
                      <div className="absolute inset-0 flex items-center px-4">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 z-10 ${hasFill ? 'bg-white text-[#7765DA]' : 'bg-[#7765DA] text-white'}`}>
                          {optIndex + 1}
                        </div>
                        <span className={`ml-3 font-medium flex-1 z-10 ${hasFill ? 'text-white' : 'text-[#373737]'}`}>{option.text}</span>
                        <span className="text-[#373737] font-semibold z-10">{option.percentage || 0}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
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

