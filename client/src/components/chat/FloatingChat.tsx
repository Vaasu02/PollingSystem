import { useState, useEffect } from 'react';
import { useSessionContext } from '../../context/SessionContext';
import { useSocket } from '../../hooks/useSocket';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Participant {
  sessionId: string;
  userName: string;
  userType: string;
}

const FloatingChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('participants');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { sessionId, userType, clearSession } = useSessionContext();
  const { socket } = useSocket(sessionId);
  const navigate = useNavigate();

  const loadParticipants = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const response = await api.sessions.getParticipants(sessionId);
      setParticipants(response.data.participants || []);
    } catch (error) {
      console.error('Failed to load participants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === 'participants') {
      loadParticipants();
    }
  }, [isOpen, activeTab, sessionId]);

  useEffect(() => {
    if (!socket) return;

    const handleStudentKicked = (data: any) => {
      if (data.targetSessionId === sessionId) {
        clearSession();
        navigate('/kicked');
      } else {
        loadParticipants();
      }
    };

    socket.on('student_kicked', handleStudentKicked);

    return () => {
      socket.off('student_kicked', handleStudentKicked);
    };
  }, [socket, sessionId, navigate, clearSession]);

  const handleKickOut = async (targetSessionId: string) => {
    if (!sessionId || userType !== 'teacher') return;
    
    try {
      await api.sessions.kickStudent({
        teacherSessionId: sessionId,
        targetSessionId,
      });
      loadParticipants();
    } catch (error: any) {
      console.error('Failed to kick student:', error);
      alert(error.message || 'Failed to kick student');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#7765DA] rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-all z-50"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H6L4 18V4H20V16Z"
            fill="white"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-xl border border-[#F2F2F2] z-50 overflow-hidden">
          <div className="flex border-b border-[#F2F2F2]">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === 'chat'
                  ? 'text-[#7765DA] border-b-2 border-[#7765DA]'
                  : 'text-[#6E6E6E] hover:text-[#373737]'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab('participants')}
              className={`flex-1 py-3 text-sm font-medium transition-all ${
                activeTab === 'participants'
                  ? 'text-[#7765DA] border-b-2 border-[#7765DA]'
                  : 'text-[#6E6E6E] hover:text-[#373737]'
              }`}
            >
              Participants
            </button>
          </div>

          <div className="h-80 overflow-y-auto">
            {activeTab === 'chat' && (
              <div className="p-4 text-center text-[#6E6E6E]">
                <p>Chat feature coming soon...</p>
              </div>
            )}

            {activeTab === 'participants' && (
              <div className="p-4">
                {isLoading ? (
                  <div className="text-center text-[#6E6E6E]">Loading...</div>
                ) : participants.filter(p => p.userType === 'student').length === 0 ? (
                  <div className="text-center text-[#6E6E6E]">No students yet</div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-[#6E6E6E] pb-2 border-b border-[#F2F2F2]">
                      <span>Name</span>
                      {userType === 'teacher' && <span>Action</span>}
                    </div>
                    {participants
                      .filter((participant) => participant.userType === 'student')
                      .map((participant) => (
                      <div
                        key={participant.sessionId}
                        className="flex justify-between items-center py-2"
                      >
                        <span className="text-[#373737] font-medium">
                          {participant.userName}
                        </span>
                        {userType === 'teacher' && (
                          <button
                            onClick={() => handleKickOut(participant.sessionId)}
                            className="text-[#2196F3] text-sm hover:underline"
                          >
                            Kick out
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingChat;

