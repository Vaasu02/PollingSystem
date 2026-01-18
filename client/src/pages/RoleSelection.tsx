import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionContext } from '../context/SessionContext';
import { storage } from '../utils/storage';

const RoleSelection = () => {
  const [selectedRole, setSelectedRole] = useState<'teacher' | 'student' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { createSession } = useSessionContext();

  const handleContinue = async () => {
    if (!selectedRole) return;

    if (selectedRole === 'student') {
      storage.setUserType('student');
      navigate('/student/name');
      return;
    }

    try {
      setIsLoading(true);
      const sessionId = await createSession({
        userType: 'teacher',
        userName: 'Teacher',
      });

      if (sessionId) {
        navigate('/teacher/create');
      }
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] px-4 py-2 rounded-full flex items-center gap-2">
            <span className="text-white font-semibold">⚡ Intervue Poll</span>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-[#373737] text-center mb-4">
          Welcome to the Live Polling System
        </h1>

        <p className="text-[#6E6E6E] text-center mb-12">
          Please select the role that best describes you to begin using the live polling system.
        </p>

        <div className="flex gap-6 justify-center mb-8">
          <div
            onClick={() => setSelectedRole('student')}
            className={`w-80 p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === 'student'
                ? 'border-[#7765DA] bg-white'
                : 'border-[#F2F2F2] bg-white hover:border-[#6E6E6E]'
            }`}
          >
            <h3 className="text-xl font-bold text-[#373737] mb-2">I'm a Student</h3>
            <p className="text-sm text-[#6E6E6E]">
              Lorem ipsum is simply dummy text of the printing and typesetting industry.
            </p>
          </div>

          <div
            onClick={() => setSelectedRole('teacher')}
            className={`w-80 p-6 rounded-lg border-2 cursor-pointer transition-all ${
              selectedRole === 'teacher'
                ? 'border-[#7765DA] bg-white'
                : 'border-[#F2F2F2] bg-white hover:border-[#6E6E6E]'
            }`}
          >
            <h3 className="text-xl font-bold text-[#373737] mb-2">I'm a Teacher</h3>
            <p className="text-sm text-[#6E6E6E]">
              Submit answers and view live poll results in real-time.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className={`px-8 py-3 rounded-lg text-white font-semibold transition-all ${
              selectedRole && !isLoading
                ? 'bg-gradient-to-r from-[#7765DA] to-[#4F0DCE] hover:opacity-90 cursor-pointer'
                : 'bg-[#6E6E6E] cursor-not-allowed opacity-50'
            }`}
          >
            {isLoading ? 'Please wait...' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;

